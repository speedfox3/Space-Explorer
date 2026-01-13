from sqlalchemy import Column, Integer, String, JSON, DateTime
from app.db.base import Base
from datetime import datetime


class Galaxy(Base):
    __tablename__ = "galaxies"

    id = Column(Integer, primary_key=True)
    seed = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
