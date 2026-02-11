export type SignalType =
  | 'ancient_probe'
  | 'debris_field'
  | 'planet_signature';

export interface Signal {
  id: string;
  type: SignalType;
  systemId: string;

  uncertainty: number; // 0..1 (1 = very uncertain)
  strength: number;    // 0..1

  distanceToTarget: number; // exploration progress (0 = located)

  discoveredAt: string;
}