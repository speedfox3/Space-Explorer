import { Player } from "../../domain/models/Player";

export class MemoryPlayerRepository {
  private players = new Map<string, Player>();

  get(id: string) {
    return this.players.get(id);
  }

  save(p: Player) {
    this.players.set(p.id, p);
  }
}