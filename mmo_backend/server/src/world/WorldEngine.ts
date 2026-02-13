import { MemoryPlayerRepository } from "../infrastructure/memory/MemoryPlayerRepository";
import { Universe } from "../domain/models/Universe";
import { SpaceObject } from "../domain/models/SpaceObject";

const SYSTEM_SIZE = 200;
const HALF = 100;
const INTERACT_RADIUS = 5;

export class WorldEngine {

  constructor(
    private repo: MemoryPlayerRepository,
    private universe: Universe
  ) {}

  private getCurrentSystem() {
    const p = this.repo.get("player1");
    if (!p) return null;

    return this.universe.getSystem(p.systemId);
  }

  tick() {
    const p = this.repo.get("player1");
    if (!p) return;

    if (p.energy < p.maxEnergy) {
      const regen = p.radarActive ? 0.3 : 0.8;
      p.energy = Math.min(p.maxEnergy, p.energy + regen);
      this.repo.save(p);
    }
  }

  move(dx: number, dy: number) {
    const p = this.repo.get("player1");
    if (!p) return;

    p.x = Math.max(-HALF, Math.min(HALF, p.x + dx));
    p.y = Math.max(-HALF, Math.min(HALF, p.y + dy));

    if (p.radarActive) {
      p.energy -= 1;
      if (p.energy <= 0) {
        p.energy = 0;
        p.radarActive = false;
      }
    }

    this.repo.save(p);
  }

  toggleRadar() {
    const p = this.repo.get("player1");
    if (!p) return;

    p.radarActive = !p.radarActive;
    this.repo.save(p);
  }

  getClosestUndiscovered() {
    const p = this.repo.get("player1");
    if (!p) return null;

    const system = this.getCurrentSystem();
    if (!system) return null;

    const objectCandidates = system.objects.filter(o => !o.discovered);

const wormholeCandidates = system.wormholes.map(w => ({
  id: w.id,
  type: "wormhole",
  x: 0,
  y: 0,
  status: "undiscovered",
  discovered: w.discovered,
  wormhole: w
}));

const candidates = [...objectCandidates, ...wormholeCandidates];
    if (!candidates.length) return null;

    let closest = candidates[0];
    let minDist = Infinity;

    for (const o of candidates) {
      const d = Math.hypot(o.x - p.x, o.y - p.y);
      if (d < minDist) {
        minDist = d;
        closest = o;
      }
    }

    return { object: closest, distance: minDist };
  }

 interact() {
  const target = this.getClosestUndiscovered();
  if (!target) return;

  if (target.distance <= INTERACT_RADIUS) {

    if (target.object.type === "wormhole") {
      return { type: "wormhole", data: target.object };
    }

    target.object.discovered = true;
    return { type: "object", data: target.object };
  }
}

  resolveMinigame(objectId: string, score: number, maxScore: number) {
    const system = this.getCurrentSystem();
    if (!system) return;

    const obj = system.objects.find((o: SpaceObject) => o.id === objectId);
    if (!obj) return;

    const ratio = score / maxScore;
    const multiplier = 0.4 + ratio * 0.8;

    obj.multiplier = multiplier;
  }

  claimObject(objectId: string, playerId: string) {
    const system = this.getCurrentSystem();
    if (!system) return null;

    const obj = system.objects.find((o: SpaceObject) => o.id === objectId);
    if (!obj) return null;

    if (obj.status === "claimed") return null;

    obj.status = "claimed";
    obj.claimedBy = playerId;

    const mult = obj.multiplier ?? 1;

    obj.finalValue = obj.baseValue * mult;
    obj.finalResources = obj.baseResources * mult;

    return obj;
  }

  getClaimedBy(playerId: string) {
    const system = this.getCurrentSystem();
    if (!system) return [];

    return system.objects.filter((o: SpaceObject) => o.claimedBy === playerId);
  }

 getState() {
  const p = this.repo.get("player1");
  if (!p) return null;

  const system = this.getCurrentSystem();
  if (!system) return null;

  const radarData = p.radarActive ? this.getClosestUndiscovered() : null;
  const canInteract = radarData ? radarData.distance <= INTERACT_RADIUS : false;

  return {
    player: p,
    radar: radarData,
    stars: system.stars,
    systemBackground: system.backgroundColor,
    starColor: system.starColor,
    canInteract
  };
}

}

