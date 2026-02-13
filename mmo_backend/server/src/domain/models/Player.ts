export interface Player {
  id: string;
  x: number;
  y: number;
  energy: number;
  systemId: string;
  maxEnergy: number;
  radarActive: boolean;
  radarRange: number;
}