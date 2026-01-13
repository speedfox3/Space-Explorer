from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class Ship(Base):
    __tablename__ = "ships"

    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="ships")

    name = Column(String, default="Unnamed Ship")
    level = Column(Integer, default=1)
    hp_current = Column(Integer, default=100)
    hp_max = Column(Integer, default=100)
    modules = Column(JSON, default={})  # list/dict of equipped modules
    cargo_capacity = Column(Integer, default=100)
    sensors = Column(Integer, default=1)
    inventory = Column(JSON, default={})
    position = Column(JSON, default={})  # {galaxy_id, system_id, x, y}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
