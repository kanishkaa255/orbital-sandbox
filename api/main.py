from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from physics.engine import Body, step

from .db import SessionLocal
from .models import Simulation
from .schemas import SimulationCreate, SimulationOut

import redis
from rq import Queue


redis_conn = redis.from_url("redis://localhost:6379")
queue = Queue(connection=redis_conn)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    new_sim = Simulation(name=simulation.name, config=simulation.config)
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

@app.post("/simulations/{simulation_id}/fork", response_model=SimulationOut)
def fork_simulation(simulation_id: int, db: Session = Depends(get_db)):
    original_sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if original_sim is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    forked_sim = Simulation(name=f"{original_sim.name} (fork)", config=original_sim.config, forked_from_id=original_sim.id)
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

    queue.enqueue("worker.tasks.run_prediction_job", simulation_id)

    return {"status": "prediction started"}