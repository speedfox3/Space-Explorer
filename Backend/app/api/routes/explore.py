from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.api.routes.player import get_current_user
import random, uuid

router = APIRouter()


class ExploreReq:
    target_system_id: int


@router.post("/")
def explore(target_system_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    # Simple demo: 50% chance to spawn a minigame, otherwise immediate resource reward
    if random.random() < 0.5:
        session_id = str(uuid.uuid4())
        # In a full implementation, create MinigameSession in DB/Redis
        return {"minigame": True, "session_id": session_id}
    else:
        # immediate reward
        reward = {"resource": "ore", "amount": random.randint(10, 200)}
        return {"minigame": False, "rewards": reward}
