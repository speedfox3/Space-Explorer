from pydantic import BaseModel
from typing import Any, Dict


class ShipBase(BaseModel):
    id: int
    name: str
    level: int
    hp_current: int
    hp_max: int
    modules: Dict[str, Any]
    cargo_capacity: int
    position: Dict[str, Any]

    class Config:
        orm_mode = True
