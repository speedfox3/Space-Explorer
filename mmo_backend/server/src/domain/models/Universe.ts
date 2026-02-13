import { System } from "./System";
import { Wormhole } from "./Wormhole";


export class Universe {
  systems: Map<string, System> = new Map();
  private systemCounter: number = 3; // ya tenemos 3 base

  constructor() {
    this.createBaseSystems();
    this.connectBaseSystems();
  }

  createProceduralSystem(originSystemId: string): string {
  const newId = `sys_${this.systemCounter++}`;

  const system: System = {
    id: newId,
    name: newId.toUpperCase(),
    isBase: false,
    objects: [],
    wormholes: [],
    stars: [],
    backgroundColor: `hsl(${Math.random()*360}, 40%, 12%)`,
    starColor: `hsl(${Math.random()*360}, 70%, 85%)`
  };

  this.generateSystemContent(system);

  this.systems.set(newId, system);

  // Crear wormhole bidireccional
  this.createWormhole(originSystemId, newId);

  // Crear un segundo wormhole "hacia adelante" no descubierto
  const forwardWh: Wormhole = {
    id: `${newId}-unknown`,
    originSystemId: newId,
    targetSystemId: `unknown_${this.systemCounter}`,
    discovered: false
  };

  system.wormholes.push(forwardWh);

  return newId;
}

  private createBaseSystems() {
    const baseSystems = [
      { id: "solara", race: "human" },
      { id: "vorth", race: "synthetic" },
      { id: "khepri", race: "organic" }
    ];

    baseSystems.forEach(s => {
      const system: System = {
        id: s.id,
        name: s.id.toUpperCase(),
        isBase: true,
        raceOrigin: s.race,
        objects: [],
        wormholes: [],
        stars: [],
        backgroundColor: this.getSystemColor(s.id),
        starColor: this.getStarColor(s.id)
      };

      this.generateSystemContent(system);
      this.systems.set(s.id, system);
    });
  }

  private getSystemColor(id: string): string {
    switch(id) {
      case "solara": return "#000015";
      case "vorth": return "#120000";
      case "khepri": return "#001200";
      default: return "#000000";
    }
  }

  private getStarColor(id: string): string {
    switch(id) {
      case "solara": return "white";
      case "vorth": return "#ffaaaa";
      case "khepri": return "#aaffaa";
      default: return "white";
    }
  }

  private connectBaseSystems() {
    const ids = Array.from(this.systems.keys());

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        this.createWormhole(ids[i], ids[j]);
      }
    }
  }

  private createWormhole(a: string, b: string) {
    const whA: Wormhole = {
      id: `${a}-${b}`,
      originSystemId: a,
      targetSystemId: b,
      discovered: true
    };

    const whB: Wormhole = {
      id: `${b}-${a}`,
      originSystemId: b,
      targetSystemId: a,
      discovered: true
    };

    this.systems.get(a)?.wormholes.push(whA);
    this.systems.get(b)?.wormholes.push(whB);
  }

  private generateSystemContent(system: System) {
    const SYSTEM_SIZE = 200;
    const HALF = 100;

    const types = ["planet","asteroid","derelict"] as const;

    for (let i = 0; i < 20; i++) {
      system.objects.push({
        id: `${system.id}_obj_${i}`,
        type: types[Math.floor(Math.random()*types.length)],
        x: Math.random()*SYSTEM_SIZE - HALF,
        y: Math.random()*SYSTEM_SIZE - HALF,
        discovered: false,
        baseValue: Math.floor(Math.random()*1000)+100,
        baseResources: Math.floor(Math.random()*500)+50,
        status: "undiscovered"
      });
    }

    for (let i = 0; i < 600; i++) {
      system.stars.push({
        x: Math.random()*SYSTEM_SIZE*3 - SYSTEM_SIZE*1.5,
        y: Math.random()*SYSTEM_SIZE*3 - SYSTEM_SIZE*1.5,
        layer: Math.random() < 0.33 ? 0.3 : (Math.random() < 0.66 ? 0.6 : 1)
      });
    }
  }

  getSystem(id: string): System | undefined {
    return this.systems.get(id);
  }
}
