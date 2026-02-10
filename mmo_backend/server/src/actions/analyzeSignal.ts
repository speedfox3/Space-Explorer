import { Player } from '../models/player.js';
import { persistPlayer } from '../state/gameState.js';

export function startAnalyzeSignal(player: Player, signalId: string) {
  if (player.currentAction) {
    throw new Error('Player already has an active action');
  }

  const signalExists = player.signals.some(s => s.id === signalId);
  if (!signalExists) {
    throw new Error('Signal not found');
  }

  if (player.fuel < 5) {
    throw new Error('Not enough fuel');
  }

  player.fuel -= 5;

  player.currentAction = {
    type: 'analyze_signal',
    remainingTicks: 6,
    signalId,
  };
}
