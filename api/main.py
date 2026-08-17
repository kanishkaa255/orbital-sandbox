import os

import redis
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from rq import Queue
from sqlalchemy.orm import Session

from physics.engine import Body, step

from .db import SessionLocal
from .models import Simulation
from .schemas import SimulationCreate, SimulationOut

redis_conn = redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379"))
queue = Queue(connection=redis_conn)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from rq import Retry


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/simulations", response_model=SimulationOut)
def create_simulation(simulation: SimulationCreate, db: Session = Depends(get_db)):
    new_sim = Simulation(name=simulation.name, config=simulation.config, initial_config = simulation.config,)
    db.add(new_sim)
    db.commit()
    db.refresh(new_sim)
    return new_sim

@app.get("/simulations", response_model=list[SimulationOut])
def list_simulations(db: Session = Depends(get_db)):
    simulations = db.query(Simulation).all()
    return simulations

@app.get("/simulations/{simulation_id}", response_model=SimulationOut)
def get_simulation(simulation_id: int, db: Session = Depends(get_db)):
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return simulation

class DuplicateCheckRequest(BaseModel):
    bodies: list[dict]

def bodies_match(bodies_a, bodies_b):
    if len(bodies_a) != len(bodies_b):
        return False
    def sort_key(body):
        return(body.get("mass",0), body.get("x", 0), body.get("y", 0), body.get("vx",0), body.get("vy",0))

    sorted_a = sorted(bodies_a, key=sort_key)
    sorted_b = sorted(bodies_b, key=sort_key)

    for a, b in zip(sorted_a, sorted_b):
        for field in ["mass", "x", "y", "vx", "vy", "radius"]:
            if a.get(field) != b.get(field):
                return False
    return True

@app.post("/simulations/check-duplicate")
def check_duplicate(payload: DuplicateCheckRequest, db: Session = Depends(get_db)):
    all_sims = db.query(Simulation).all()
    for sim in all_sims:
        if sim.initial_config and bodies_match(payload.bodies, sim.initial_config.get("bodies", [])):
            return {"duplicate": {"id": sim.id, "name": sim.name}}
    return {"duplicate": None}

@app.post("/simulations/{simulation_id}/fork", response_model=SimulationOut)
def fork_simulation(simulation_id: int, db: Session = Depends(get_db)):
    original_sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if original_sim is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    forked_sim = Simulation(name=f"{original_sim.name} (fork)", config=original_sim.config, initial_config = original_sim.initial_config, forked_from_id=original_sim.id)
    db.add(forked_sim)
    db.commit()
    db.refresh(forked_sim)
    return forked_sim

def body_to_dict(body):
    return {
        "mass": body.mass,
        "x": body.x,
        "y": body.y,
        "vx": body.vx,
        "vy": body.vy,
        "radius": body.radius,
        "color": body.color,
    }

def dict_to_body(d, name="body"):
    return Body(name=name, mass=d["mass"], x=d["x"], y=d["y"], vx=d["vx"], vy=d["vy"], radius=d.get("radius", 1.0), color=d.get("color", "white"))

@app.post("/simulations/{simulation_id}/step", response_model=SimulationOut)
def step_simulation(simulation_id: int, num_steps: int = 100, dt: float = 3600, db: Session = Depends(get_db)):
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    bodies = [dict_to_body(b, name=f"body_{i}") for i, b in enumerate(simulation.config["bodies"])]
    for _ in range(num_steps):
        step(bodies, dt)
    simulation.config = {**simulation.config, "bodies": [body_to_dict(b) for b in bodies]}
    db.add(simulation)
    db.commit()
    return simulation   

@app.post("/simulations/{simulation_id}/predict")
def predict_simulation(simulation_id: int, db: Session = Depends(get_db)):
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")

    simulation.ai_narration_status = "pending"
    db.commit()

    queue.enqueue(
    "worker.tasks.run_prediction_job",
    simulation_id,
    retry=Retry(max=3),
    on_failure="worker.tasks.mark_prediction_failed",
    )       

    return {"status": "prediction started"}

@app.get("/simulations/{simulation_id}/prediction")
def get_prediction(simulation_id: int, db: Session = Depends(get_db)):
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")

    return {
        "status": simulation.ai_narration_status,
        "narration": simulation.ai_narration,
    }


class PredictPreviewRequest(BaseModel):
    bodies: list[dict]

@app.post("/predict-preview")
def predict_preview(payload: PredictPreviewRequest):
    from worker.tasks import analyze_simulation, generate_narration

    summary = analyze_simulation({"bodies": payload.bodies})
    narration = generate_narration(summary)
    return {"narration": narration}