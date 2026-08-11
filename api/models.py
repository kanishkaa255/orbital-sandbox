from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from .db import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    config = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    forked_from_id = Column(Integer, ForeignKey("simulations.id"), nullable=True)
    ai_narration = Column(Text, nullable=True)
    ai_narration_status = Column(String, nullable=True) 