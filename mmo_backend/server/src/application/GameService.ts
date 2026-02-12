import { WorldEngine } from "../world/WorldEngine";

export class GameService {
  constructor(private world: WorldEngine) {}

  movePlayer(playerId: string, direction: string) {
    this.world.enqueueAction({
      type: "MOVE",
      playerId,
      direction,
    });
  }
}