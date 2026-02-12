export interface Player {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  radarActive: boolean;
  radarRange: number;
}