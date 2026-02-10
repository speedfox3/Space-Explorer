export type SignalType =
  | 'debris_field'
  | 'ancient_probe'
  | 'distress_call';

export interface Signal {
  id: string;
  type: SignalType;
  discoveredAt: string;
}
