import { Player } from '../models/player.js';
import { persistPlayer } from '../state/gameState.js';

export async function resolveAnalyzeSignal(player: Player) {
  const action = player.currentAction;
  if (!action || action.type !== 'analyze_signal' || !action.signalId) return;

  const accuracy = Math.min(1, Math.random() * 0.5 + 0.5);

  const confidence =
    accuracy > 0.8 ? 'high' :
    accuracy > 0.6 ? 'medium' : 'low';

  player.analyses.push({
    signalId: action.signalId,
    accuracy,
    confidence,
    analyzedAt: new Date().toISOString(),
  });

  player.currentAction = undefined;
  await persistPlayer(player);
}
