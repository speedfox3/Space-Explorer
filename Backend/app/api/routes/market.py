from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.api.routes.player import get_current_user
from app.schemas.market import MarketOrderReq, MarketOrderResp
from app.schemas.trade import TradeResp
from app.models.market_order import MarketOrder, OrderType
from app.models.trade import Trade

router = APIRouter()


@router.get("/orders")
def list_orders(item_type: str = None, db: Session = Depends(get_db)):
    q = db.query(MarketOrder)
    if item_type:
        q = q.filter(MarketOrder.item_type == item_type)
    return q.order_by(MarketOrder.price).all()


@router.post("/order", response_model=MarketOrderResp)
def create_order(req: MarketOrderReq, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if req.amount <= 0 or req.price <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount or price")
    try:
        order_type = OrderType(req.order_type)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order_type")
    order = MarketOrder(player_id=current_user.id, item_type=req.item_type, order_type=order_type, price=req.price, amount=req.amount)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get('/trades', response_model=List[TradeResp])
def list_trades(
    item_type: Optional[str] = Query(None, description="Filter by item_type"),
    start: Optional[datetime] = Query(None, description="Start datetime (ISO)"),
    end: Optional[datetime] = Query(None, description="End datetime (ISO)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    player_only: bool = Query(False, description="If true, return only current player's trades"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Trade)
    if item_type:
        q = q.filter(Trade.item_type == item_type)
    if start:
        q = q.filter(Trade.created_at >= start)
    if end:
        q = q.filter(Trade.created_at <= end)
    if player_only:
        q = q.filter((Trade.buyer_id == current_user.id) | (Trade.seller_id == current_user.id))
    results = q.order_by(Trade.created_at.desc()).offset(offset).limit(limit).all()
    return results
