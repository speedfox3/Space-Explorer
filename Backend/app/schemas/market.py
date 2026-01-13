from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class MarketOrderReq(BaseModel):
    item_type: str
    order_type: str
    price: Decimal
    amount: int


class MarketOrderResp(BaseModel):
    id: int
    item_type: str
    order_type: str
    price: Decimal
    amount: int
    filled: int

    class Config:
        orm_mode = True
