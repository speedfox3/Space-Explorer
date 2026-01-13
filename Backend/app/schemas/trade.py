from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class TradeResp(BaseModel):
    id: int
    buyer_id: Optional[int]
    seller_id: Optional[int]
    item_type: str
    price: Decimal
    amount: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
