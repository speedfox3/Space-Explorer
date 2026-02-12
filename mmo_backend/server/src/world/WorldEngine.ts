import { PlayerRepository } from "../domain/repositories/PlayerRepository";
import { Signal } from "../domain/models/Signal";

export class WorldEngine {
  private actionQueue: any[] = [];

  private signals: Signal[] = [
    { id: "signal1", realX: 12, realY: 6, uncertainty: 20, discovered: false },
    { id: "signal2", realX: -15, realY: -8, uncertainty: 20, discovered: false }
  ];

  constructor(private repo: PlayerRepository) {}

  enqueueAction(action: any) {
    this.actionQueue.push(action);
  }

  tick() {
    this.processActions();
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

        const signal = this.signals.find(s => s.id === a.targetId);
        if (signal && !signal.discovered) {
          signal.uncertainty *= 0.6;
          if (signal.uncertainty < 2) {
            signal.discovered = true;
            signal.uncertainty = 0;
          }
        }

        this.repo.save(p);
      }
    }
  }

  getState(playerId: string) {
    const p = this.repo.getById(playerId);
    if (!p) return null;

    const visibleSignals = p.radarActive
      ? this.signals.map(s => ({
          id: s.id,
          realX: s.realX,
          realY: s.realY,
          uncertainty: s.uncertainty,
          discovered: s.discovered
        }))
      : [];

    return { player: p, signals: visibleSignals };
  }
}