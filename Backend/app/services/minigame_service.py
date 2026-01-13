import uuid
from typing import Dict, Any
from app.models.minigame_session import MinigameSession
from app.db.base import SessionLocal
from datetime import datetime
import random
from app.services.reward_service import RewardService


class MinigameService:
    @staticmethod
    def start(player_id: int, game_type: str, params: Dict[str, Any] = None) -> str:
        db = SessionLocal()
        try:
            session = MinigameSession(player_id=player_id, game_type=game_type, state={'params': params or {}}, status='active')
            db.add(session)
            db.commit()
            db.refresh(session)
            return str(session.id)
        finally:
            db.close()

    @staticmethod
    def submit(session_id: int, player_input: Dict[str, Any]) -> Dict[str, Any]:
        db = SessionLocal()
        try:
            session = db.query(MinigameSession).filter(MinigameSession.id == int(session_id)).first()
            if not session:
                return {'error': 'session_not_found'}
            if session.status != 'active':
                return {'error': 'session_not_active'}

            # example game types
            if session.game_type == 'timing':
                # player_input expected {'hit_time': float, 'target': float}
                hit = abs(player_input.get('hit_time', 0) - player_input.get('target', 0))
                success = hit < 0.2
                reward = {'resource': 'ore', 'amount': int(max(1, 100 * (0.2 - hit))) } if success else {'resource': 'ore', 'amount': 0}
                session.result = {'success': success, 'hit': hit, 'reward': reward}
                session.status = 'finished'
                session.updated_at = datetime.utcnow()
                db.add(session)
                db.commit()
                # apply reward if any
                if reward and reward.get('amount', 0) > 0:
                    RewardService.apply_reward_to_player(session.player_id, reward)
                return {'result': session.result}

            if session.game_type == 'risk':
                # decision: player_input {'choice': 'safe'|'risky'}
                choice = player_input.get('choice')
                if choice == 'risky':
                    # 50% chance big reward, else lose
                    if random.random() < 0.5:
                        reward = {'resource': 'ore', 'amount': 500}
                        success = True
                    else:
                        reward = {'resource': 'ore', 'amount': 0}
                        success = False
                else:
                    reward = {'resource': 'ore', 'amount': 50}
                    success = True
                session.result = {'success': success, 'choice': choice, 'reward': reward}
                session.status = 'finished'
                session.updated_at = datetime.utcnow()
                db.add(session)
                db.commit()
                if reward and reward.get('amount', 0) > 0:
                    RewardService.apply_reward_to_player(session.player_id, reward)
                return {'result': session.result}

            return {'error': 'unknown_game_type'}
        finally:
            db.close()

    @staticmethod
    def status(session_id: int) -> Dict[str, Any]:
        db = SessionLocal()
        try:
            session = db.query(MinigameSession).filter(MinigameSession.id == int(session_id)).first()
            if not session:
                return {'error': 'session_not_found'}
            return {'id': session.id, 'status': session.status, 'result': session.result}
        finally:
            db.close()
