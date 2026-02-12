import { PlayerRepository } from "../domain/repositories/PlayerRepository";

export class WorldEngine {
  private actionQueue: any[] = [];

  constructor(private playerRepo: PlayerRepository) {}

  enqueueAction(action: any) {
    this.actionQueue.push(action);
  }

  tick() {
    this.processActions();
  }

  private processActions() {
    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift();

      if (action.type === "MOVE") {
        const player = this.playerRepo.getById(action.playerId);
        if (player) {
          player.x += action.dx;
          player.y += action.dy;
          this.playerRepo.save(player);
        }
      }
    }
  }
}