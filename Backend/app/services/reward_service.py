from app.db.base import SessionLocal
from app.models.user import User
from app.models.ship import Ship
from sqlalchemy.orm import Session


class RewardService:
    @staticmethod
    def apply_reward_to_player(player_id: int, reward: dict):
        """reward: {'resource': 'ore', 'amount': 100} or {'currency': 50} """
        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.id == player_id).first()
            if not user:
                return False
            # currency reward
            if 'currency' in reward:
                user.currency = (user.currency or 0) + reward.get('currency', 0)
                db.add(user)
                db.commit()
                return True

            # resource reward: add to player's first ship inventory
            res_type = reward.get('resource')
            amt = int(reward.get('amount', 0))
            if res_type and amt > 0:
                ship = db.query(Ship).filter(Ship.owner_id == player_id).first()
                if not ship:
                    # create starter ship if missing
                    ship = Ship(owner_id=player_id, name=f"player{player_id}_ship")
                    db.add(ship)
                    db.commit()
                    db.refresh(ship)
                inv = ship.inventory or {}
                inv[res_type] = int(inv.get(res_type, 0)) + amt
                ship.inventory = inv
                db.add(ship)
                db.commit()
                return True

            return False
        finally:
            db.close()
