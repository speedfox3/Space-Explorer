from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class Trade(Base):
    __tablename__ = 'trades'

    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    seller_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    item_type = Column(String, nullable=False)
    price = Column(Numeric(18,2), nullable=False)
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship('User', foreign_keys=[buyer_id])
    seller = relationship('User', foreign_keys=[seller_id])
