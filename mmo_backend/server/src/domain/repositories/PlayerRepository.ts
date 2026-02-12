import { Player } from "../models/Player";

export interface PlayerRepository {
  getById(id: string): Player | undefined;
  getAll(): Player[];
  save(player: Player): void;
}