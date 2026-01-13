from fastapi import APIRouter
from app.api.routes import auth, player, ship, market, explore, minigame

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(player.router, prefix="/player", tags=["player"])
api_router.include_router(ship.router, prefix="/ship", tags=["ship"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(explore.router, prefix="/explore", tags=["explore"])
api_router.include_router(minigame.router, prefix="/minigame", tags=["minigame"])
