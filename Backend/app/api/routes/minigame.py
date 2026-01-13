from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.routes.player import get_current_user
from app.services.minigame_service import MinigameService

router = APIRouter()


class StartReq(BaseModel):
    game_type: str
    params: dict = {}


class SubmitReq(BaseModel):
    session_id: int
    input: dict


@router.post("/start")
def start(req: StartReq, current_user=Depends(get_current_user)):
    session_id = MinigameService.start(current_user.id, req.game_type, req.params)
    return {"session_id": session_id}


@router.post("/submit")
def submit(req: SubmitReq, current_user=Depends(get_current_user)):
    res = MinigameService.submit(req.session_id, req.input)
    if 'error' in res:
        raise HTTPException(status_code=400, detail=res['error'])
    return res


@router.get("/status/{session_id}")
def status(session_id: int, current_user=Depends(get_current_user)):
    return MinigameService.status(session_id)
