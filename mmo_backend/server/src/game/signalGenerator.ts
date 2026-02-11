import { Signal, SignalType } from '../models/Signal.js';

const SIGNAL_TABLE: { type: SignalType; weight: number }[] = [
  { type: 'debris_field', weight: 40 },
  { type: 'ancient_probe', weight: 30 },
  { type: 'distress_call', weight: 20 },
  { type: 'planet_signature', weight: 10 },
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

    systemId: 'sol-1',

    // empieza con alta incertidumbre
    uncertainty: 0.8 + Math.random() * 0.15, // entre 0.8 y 0.95

    // opcional pero útil para futuro
    strength: Math.random(),

    // distancia inicial abstracta
    distanceToTarget: 80 + Math.floor(Math.random() * 40), // 80–120

    discoveredAt: new Date().toISOString(),
  };
}
