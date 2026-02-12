import { MemoryPlayerRepository } from "../infrastructure/memory/MemoryPlayerRepository";
import { SpaceObject } from "../domain/models/SpaceObject";

const SYSTEM_SIZE = 200;
const HALF = 100;
const RADAR_RANGE = 40;
const INTERACT_RADIUS = 5;

export class WorldEngine {

  private objects: SpaceObject[] = [];
  private stars: {x:number,y:number}[] = [];

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

    for (let i=0;i<400;i++) {
      this.stars.push({
        x: Math.random()*SYSTEM_SIZE - HALF,
        y: Math.random()*SYSTEM_SIZE - HALF
      });
    }
  }

  tick() {
    const p = this.repo.get("player1");
    if (!p) return;

    if (p.energy < p.maxEnergy) {
      let regen = 0.8;
      if (p.radarActive) regen = 0.3;
      p.energy = Math.min(p.maxEnergy, p.energy + regen);
      this.repo.save(p);
    }
  }

  move(dx:number,dy:number) {
    const p = this.repo.get("player1");
    if (!p) return;

    let newX = p.x + dx;
    let newY = p.y + dy;

    newX = Math.max(-HALF, Math.min(HALF, newX));
    newY = Math.max(-HALF, Math.min(HALF, newY));

    p.x = newX;
    p.y = newY;

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

  interact(objectId:string) {
    const p = this.repo.get("player1");
    if (!p) return;

    const obj = this.objects.find(o=>o.id===objectId);
    if (!obj) return;

    const dist = Math.hypot(obj.x - p.x, obj.y - p.y);

    if (dist <= INTERACT_RADIUS) {
      obj.discovered = true;
    }
  }

  getState() {
    const p = this.repo.get("player1");
    if (!p) return null;

    const visibleObjects = p.radarActive
      ? this.objects.filter(o => {
          const d = Math.hypot(o.x - p.x, o.y - p.y);
          return d <= RADAR_RANGE;
        })
      : [];

    return {
      player: p,
      objects: visibleObjects,
      stars: this.stars,
      constants: {
        systemSize: SYSTEM_SIZE,
        radarRange: RADAR_RANGE,
        interactRadius: INTERACT_RADIUS
      }
    };
  }
}