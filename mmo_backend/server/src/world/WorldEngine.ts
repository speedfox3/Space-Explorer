import { PlayerRepository } from "../domain/repositories/PlayerRepository";

export class WorldEngine {
  private actionQueue: any[] = [];
  private activeAnalyzes: any[] = [];

  private worldObjects = [
    { id: "signal1", x: 8, y: 4 },
    { id: "signal2", x: -10, y: -3 }
  ];

  constructor(private repo: PlayerRepository) {}

  enqueueAction(action: any) {
    this.actionQueue.push(action);
  }

  tick() {
    this.processActions();
    this.processAnalyzes();
  }

  private processActions() {
    while (this.actionQueue.length > 0) {
      const a = this.actionQueue.shift();
      const p = this.repo.getById(a.playerId);
      if (!p) continue;

      if (a.type === "MOVE") {
        p.x += a.dx;
        p.y += a.dy;

        if (p.radarActive) {
          p.energy -= 1;
          if (p.energy <= 0) {
            p.energy = 0;
            p.radarActive = false;
          }
        }
        this.repo.save(p);
      }

      if (a.type === "TOGGLE_RADAR") {
        p.radarActive = !p.radarActive;
        this.repo.save(p);
      }

      if (a.type === "ANALYZE" && p.energy >= 5) {
        p.energy -= 5;
        this.activeAnalyzes.push({
          playerId: p.id,
          targetId: a.targetId,
          progress: 0
        });
        this.repo.save(p);
      }
    }
  }

  private processAnalyzes() {
    for (const a of this.activeAnalyzes) {
      a.progress += 1;
    }
    this.activeAnalyzes = this.activeAnalyzes.filter(a => a.progress < 5);
  }

  getState(playerId: string) {
    const p = this.repo.getById(playerId);
    if (!p) return null;

    const contacts = p.radarActive
      ? this.worldObjects.map(obj => ({
          id: obj.id,
          approxX: obj.x + (Math.random() * 6 - 3),
          approxY: obj.y + (Math.random() * 6 - 3)
        }))
      : [];

    const analyze = this.activeAnalyzes.find(a => a.playerId === playerId) || null;

    return { player: p, contacts, analyze };
  }
}