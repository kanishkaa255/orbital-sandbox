from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from .db import Base

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    config = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    forked_from_id = Column(Integer, ForeignKey("simulations.id"), nullable=True)