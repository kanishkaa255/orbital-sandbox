from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SimulationCreate(BaseModel):
    name: str
    config: dict

class SimulationOut(BaseModel):
    id: int
    name: str
    config: dict
    created_at: datetime
    forked_from_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)