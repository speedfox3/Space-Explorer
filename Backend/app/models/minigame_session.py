from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class MinigameSession(Base):
    __tablename__ = "minigame_sessions"

    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    game_type = Column(String, nullable=False)
    state = Column(JSON, default={})
    status = Column(String, default='active')
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    player = relationship('User')
