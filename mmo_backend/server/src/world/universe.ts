import { System } from '../models/System.js';
import { SystemObject } from '../models/SystemObject.js';

const SYSTEM_OBJECT_COUNT = 12;
const SYSTEM_RADIUS = 500;

export const systems: Map<string, System> = new Map();

function randomInRadius() {
  return (Math.random() - 0.5) * SYSTEM_RADIUS * 2;
}

function generateObject(systemId: string): SystemObject {
  const size = Math.random() * 50 + 10;

  return {
    id: crypto.randomUUID(),
    systemId,
    type: 'debris_field',
    level: Math.floor(Math.random() * 5) + 1,
    x: randomInRadius(),
    y: randomInRadius(),
    size,
    detectionRadius: size * 3,
    resourceAmount: 100,
    maxResourceAmount: 100,
    state: 'hidden'
  };
}

export function createSystem(id: string): System {
  const system: System = {
    id,
    seed: Date.now(),
    objects: []
  };

  for (let i = 0; i < SYSTEM_OBJECT_COUNT; i++) {
    system.objects.push(generateObject(id));
  }

  systems.set(id, system);
  return system;
}