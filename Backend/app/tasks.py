from app.worker import celery_app
import time
from app.db.base import SessionLocal
from app.models.market_order import MarketOrder, OrderType
from sqlalchemy import and_
from app.models.trade import Trade
from app.models.user import User
from app.services.reward_service import RewardService


@celery_app.task(bind=True)
def demo_task(self, player_id: int, duration: int = 5):
    """Demo task that simulates a long-running job (e.g., passive collection)."""
    for i in range(duration):
        time.sleep(1)
        self.update_state(state='PROGRESS', meta={'current': i + 1, 'total': duration})
    # return example reward
    return {'player_id': player_id, 'reward': {'resource': 'ore', 'amount': 100}}


@celery_app.task
def match_market():
    """Simple market matching: match buy orders with sell orders for same item_type."""
    db = SessionLocal()
    try:
        # for simplicity, group by item_type
        item_types = db.query(MarketOrder.item_type).distinct().all()
        for (item_type,) in item_types:
            # fetch open buys (highest price first) and open sells (lowest price first)
            buys = db.query(MarketOrder).filter(and_(MarketOrder.item_type == item_type, MarketOrder.order_type == OrderType.BUY, MarketOrder.status == 'open')).order_by(MarketOrder.price.desc(), MarketOrder.created_at).all()
            sells = db.query(MarketOrder).filter(and_(MarketOrder.item_type == item_type, MarketOrder.order_type == OrderType.SELL, MarketOrder.status == 'open')).order_by(MarketOrder.price.asc(), MarketOrder.created_at).all()
            bi = 0
            si = 0
            while bi < len(buys) and si < len(sells):
                buy = buys[bi]
                sell = sells[si]
                if float(buy.price) >= float(sell.price):
                    # execute trade at midpoint price
                    trade_price = (float(buy.price) + float(sell.price)) / 2
                    qty = min(buy.amount - buy.filled, sell.amount - sell.filled)
                    # apply fill
                    buy.filled += qty
                    sell.filled += qty
                    if buy.filled >= buy.amount:
                        buy.status = 'filled'
                    if sell.filled >= sell.amount:
                        sell.status = 'filled'
                    db.add(buy)
                    db.add(sell)
                    # persist trade and transfer currency/resources
                    trade = Trade(buyer_id=buy.player_id, seller_id=sell.player_id, item_type=item_type, price=trade_price, amount=qty)
                    db.add(trade)
                    # transfer currency: buyer pays, seller receives
                    buyer = db.query(User).filter(User.id == buy.player_id).first()
                    seller = db.query(User).filter(User.id == sell.player_id).first()
                    total_cost = trade_price * qty
                    if buyer:
                        buyer.currency = (buyer.currency or 0) - total_cost
                        db.add(buyer)
                    if seller:
                        seller.currency = (seller.currency or 0) + total_cost
                        db.add(seller)
                    # give resource to buyer
                    RewardService.apply_reward_to_player(buy.player_id, {'resource': item_type, 'amount': qty})
                    db.commit()
                    # record trade event - omitted (would publish to broker)
                else:
                    break
                if buy.status == 'filled':
                    bi += 1
                if sell.status == 'filled':
                    si += 1
    finally:
        db.close()
