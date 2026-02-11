import { Signal } from '../models/Signal.js';

export function canRevealNewSystem(signals: Signal[]): boolean {
  if (signals.length === 0) return false;

  const avgUncertainty =
    signals.reduce((a, s) => a + s.uncertainty, 0) / signals.length;

  const allLocated = signals.every(s => s.distanceToTarget === 0);

  return avgUncertainty < 0.3 && allLocated;
}