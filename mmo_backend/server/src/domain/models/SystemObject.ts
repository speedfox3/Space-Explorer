
export type ObjectState = 'hidden' | 'active' | 'depleted';

export interface SystemObject {
  id: string;
  systemId: string;
  type: string;
  level: number;
  x: number;
  y: number;
  size: number;
  detectionRadius: number;
  resourceAmount: number;
  maxResourceAmount: number;
  state: ObjectState;
}
