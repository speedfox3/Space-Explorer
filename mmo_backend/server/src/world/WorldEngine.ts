import { PlayerRepository } from "../domain/repositories/PlayerRepository";

export class WorldEngine {
  private actionQueue: any[] = [];

  constructor(private playerRepo: PlayerRepository) {}

  enqueueAction(action: any) {
    this.actionQueue.push(action);
  }

  tick() {
    this.processActions();
    this.processMovement();
    this.processEnergy();
  }

  private processActions() {
    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift();
      console.log("Processing action:", action);
    }
  }

  private processMovement() {
    const players = this.playerRepo.getAll();
    for (const player of players) {
      // TODO
    }
  }

  private processEnergy() {
    const players = this.playerRepo.getAll();
    for (const player of players) {
      // TODO
    }
  }
}
