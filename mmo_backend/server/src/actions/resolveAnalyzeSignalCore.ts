import { Signal } from '../models/Signal.js';
import { MinigameResult } from '../models/MinigameResult.js';

export function applyMinigameResult(
  signal: Signal,
  result: MinigameResult
) {
  switch (result.performance) {
    case 'excellent':
      signal.uncertainty *= 0.6;
      signal.distanceToTarget -= 25;
      break;
    case 'normal':
      signal.uncertainty *= 0.8;
      signal.distanceToTarget -= 15;
      break;
    case 'poor':
      signal.uncertainty *= 1.05;
      signal.distanceToTarget -= 5;
      break;
    case 'critical':
      signal.uncertainty = Math.min(1, signal.uncertainty + 0.2);
      signal.distanceToTarget += 10;
      break;
  }

  signal.distanceToTarget = Math.max(0, signal.distanceToTarget);
  signal.uncertainty = Math.max(0.05, Math.min(1, signal.uncertainty));
}