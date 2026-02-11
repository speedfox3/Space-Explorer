import { systems } from './universe.js';

export interface SignalReading {
  objectId: string;
  quality: string;
  distance: number;
}

export function scanSystem(systemId: string, x: number, y: number): SignalReading[] {
  const system = systems.get(systemId);
  if (!system) return [];

  const readings: SignalReading[] = [];

  for (const obj of system.objects) {
    if (obj.state === 'depleted') continue;

    const dx = obj.x - x;
    const dy = obj.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= obj.detectionRadius) {
      const ratio = distance / obj.detectionRadius;

      let quality = 'Very Poor';
      if (ratio < 0.8) quality = 'Poor';
      if (ratio < 0.6) quality = 'Good';
      if (ratio < 0.4) quality = 'Very Good';
      if (ratio < 0.2) quality = 'Exact Point';

      readings.push({
        objectId: obj.id,
        quality,
        distance: Math.round(distance)
      });
    }
  }

  return readings;
}