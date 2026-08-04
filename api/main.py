from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .db import SessionLocal
from .models import Simulation
from .schemas import SimulationCreate, SimulationOut

app = FastAPI()

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
