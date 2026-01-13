from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class UserBase(BaseModel):
    id: int
    username: str
    email: Optional[str]
    currency: Optional[Decimal]

    class Config:
        orm_mode = True
