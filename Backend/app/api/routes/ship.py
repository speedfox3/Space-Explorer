from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.api.routes.player import get_current_user
from app.models.ship import Ship
from app.schemas.ship import ShipBase

router = APIRouter()


@router.get("/", response_model=ShipBase)
def get_ship(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    ship = db.query(Ship).filter(Ship.owner_id == current_user.id).first()
    if not ship:
        # create starter ship
        ship = Ship(owner_id=current_user.id, name=f"{current_user.username}'s Vessel")
        db.add(ship)
        db.commit()
        db.refresh(ship)
    return ship
