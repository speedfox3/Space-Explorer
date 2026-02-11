import { SignalType } from '../models/Signal.js';

export interface SignalConfig {
  ticks: number;
  fuelCost: number;
  successChance: number;
  reward: string;
}

export const SIGNAL_CONFIG: Record<SignalType, SignalConfig> = {
  debris_field: {
    ticks: 4,
    fuelCost: 5,
    successChance: 0.9,
    reward: 'resource_A',
  },
  ancient_probe: {
    ticks: 8,
    fuelCost: 10,
    successChance: 0.6,
    reward: 'resource_B',
  },
  distress_call: {
    ticks: 10,
    fuelCost: 15,
    successChance: 0.4,
    reward: 'resource_C',
  },
  planet_signature: {
  ticks: 6,
  fuelCost: 8,
  successChance: 0.65,
  reward: 'planet_data',
},
};
