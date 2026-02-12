import { MemoryPlayerRepository } from "../infrastructure/memory/MemoryPlayerRepository";
import { SpaceObject } from "../domain/models/SpaceObject";

const SYSTEM_SIZE = 200;
const HALF = 100;
const INTERACT_RADIUS = 5;

export class WorldEngine {

  private objects: SpaceObject[] = [];
  private stars: {x:number,y:number,layer:number}[] = [];

  constructor(private repo: MemoryPlayerRepository) {
    this.generateSystem();
  }

  private generateSystem() {
    const types = ["planet","asteroid","derelict","wormhole"] as const;

    for (let i=0;i<20;i++) {
      this.objects.push({
        id: "obj_"+i,
        type: types[Math.floor(Math.random()*types.length)],
        x: Math.random()*SYSTEM_SIZE - HALF,
        y: Math.random()*SYSTEM_SIZE - HALF,
        discovered: false
      });
    }

    for (let i=0;i<600;i++) {
      this.stars.push({
        x: Math.random()*SYSTEM_SIZE*3 - SYSTEM_SIZE*1.5,
        y: Math.random()*SYSTEM_SIZE*3 - SYSTEM_SIZE*1.5,
        layer: Math.random() < 0.33 ? 0.3 : (Math.random() < 0.66 ? 0.6 : 1)
      });
    }
  }

  tick() {
    const p = this.repo.get("player1");
    if (!p) return;

    if (p.energy < p.maxEnergy) {
      let regen = p.radarActive ? 0.3 : 0.8;
      p.energy = Math.min(p.maxEnergy, p.energy + regen);
      this.repo.save(p);
    }
  }

  move(dx:number,dy:number) {
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

    const candidates = this.objects.filter(o => !o.discovered);
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
      target.object.discovered = true;
    }
  }

  getState() {
    const p = this.repo.get("player1");
    if (!p) return null;

    const radarData = p.radarActive ? this.getClosestUndiscovered() : null;

    const canInteract = radarData ? radarData.distance <= INTERACT_RADIUS : false;

    return {
      player: p,
      radar: radarData,
      stars: this.stars,
      canInteract
    };
  }
}