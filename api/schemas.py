from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SimulationCreate(BaseModel):
    name: str
    config: dict

class SimulationOut(BaseModel):
    id: int
    name: str
    config: dict
    created_at: datetime
    forked_from_id: int | None = None
    model_config = ConfigDict(from_attributes=True)
    ai_narration: str | None = None
    ai_narration_status: str | None = None
    initial_config: dict | None = None