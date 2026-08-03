from fastapi import FastAPI, Depends
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