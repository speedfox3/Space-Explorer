import { Signal, SignalType } from '../models/signals.js';

const SIGNAL_TABLE: { type: SignalType; weight: number }[] = [
  { type: 'debris_field', weight: 50 },
  { type: 'ancient_probe', weight: 30 },
  { type: 'distress_call', weight: 20 },
];

function weightedRandom(): SignalType {
  const total = SIGNAL_TABLE.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;

  for (const entry of SIGNAL_TABLE) {
    if ((roll -= entry.weight) <= 0) return entry.type;
  }

  return 'debris_field';
}

export function generateSignal(): Signal {
  return {
    id: crypto.randomUUID(),
    type: weightedRandom(),
    discoveredAt: new Date().toISOString(),
  };
}
