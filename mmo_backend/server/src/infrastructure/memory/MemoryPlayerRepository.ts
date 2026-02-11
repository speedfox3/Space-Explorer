import { Player } from "../../domain/models/Player.js";
import { PlayerRepository } from "../../domain/repositories/PlayerRepository";

export class MemoryPlayerRepository implements PlayerRepository {
  private players: Map<string, Player> = new Map();

  getById(id: string): Player | undefined {
    return this.players.get(id);
  }

  getAll(): Player[] {
    return Array.from(this.players.values());
  }

  save(player: Player): void {
    this.players.set(player.id, player);
  }
}