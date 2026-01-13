import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Enum, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class OrderType(enum.Enum):
    BUY = "buy"
    SELL = "sell"


class MarketOrder(Base):
    __tablename__ = "market_orders"

    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    player = relationship("User", back_populates="orders")

    item_type = Column(String, nullable=False)  # resource type or item template id
    order_type = Column(Enum(OrderType), nullable=False)
    price = Column(Numeric(18, 2), nullable=False)
    amount = Column(Integer, nullable=False)
    filled = Column(Integer, default=0)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
