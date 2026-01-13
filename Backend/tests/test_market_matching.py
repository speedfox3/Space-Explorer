from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base, get_db
import app.tasks as tasks_module
import app.services.reward_service as reward_service_module
import app.services.minigame_service as minigame_service_module
from app.models.user import User
from app.models.ship import Ship
from app.models.market_order import MarketOrder, OrderType
from app.models.trade import Trade


def test_market_matching_creates_trade_and_transfers_resources_and_currency():
    # setup in-memory DB and testing session
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    # monkeypatch SessionLocal used by modules to use testing DB
    # (modules imported above reference SessionLocal at module scope)
    import app.db.base as db_base
    db_base.SessionLocal = TestingSessionLocal
    tasks_module.SessionLocal = TestingSessionLocal
    reward_service_module.SessionLocal = TestingSessionLocal
    minigame_service_module.SessionLocal = TestingSessionLocal

    # create test data
    db = TestingSessionLocal()
    seller = User(username='seller', hashed_password='x', currency=0)
    buyer = User(username='buyer', hashed_password='x', currency=1000)
    db.add(seller)
    db.add(buyer)
    db.commit()
    db.refresh(seller)
    db.refresh(buyer)

    # create ships for both
    s_ship = Ship(owner_id=seller.id, name='SellerShip')
    b_ship = Ship(owner_id=buyer.id, name='BuyerShip')
    db.add(s_ship)
    db.add(b_ship)
    db.commit()

    # create sell order (seller sells 5 ore at price 10)
    sell_order = MarketOrder(player_id=seller.id, item_type='ore', order_type=OrderType.SELL, price=10, amount=5)
    # create buy order (buyer buys 5 ore at price 12)
    buy_order = MarketOrder(player_id=buyer.id, item_type='ore', order_type=OrderType.BUY, price=12, amount=5)
    db.add(sell_order)
    db.add(buy_order)
    db.commit()

    # call matching task synchronously
    tasks_module.match_market()

    # open fresh session to inspect results
    db2 = TestingSessionLocal()
    trades = db2.query(Trade).all()
    assert len(trades) == 1
    trade = trades[0]
    assert trade.item_type == 'ore'
    assert trade.amount == 5
    # trade price should be midpoint 11.0
    assert float(trade.price) == 11.0

    # check buyer and seller currency changes
    buyer_after = db2.query(User).filter(User.id == buyer.id).first()
    seller_after = db2.query(User).filter(User.id == seller.id).first()
    # total cost = 11 * 5 = 55
    assert float(buyer_after.currency) == 1000 - 55
    assert float(seller_after.currency) == 0 + 55

    # buyer should have received 5 ore in ship inventory
    buyer_ship_after = db2.query(Ship).filter(Ship.owner_id == buyer.id).first()
    inv = buyer_ship_after.inventory or {}
    assert inv.get('ore', 0) == 5

    db2.close()
    db.close()
