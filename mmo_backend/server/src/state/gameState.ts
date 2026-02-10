import { Player } from '../models/player.js';
import { loadPlayer, savePlayer } from '../db/players.js';

export const players = new Map<string, Player>();

export async function getOrCreatePlayer(id: string): Promise<Player> {
  if (players.has(id)) {
    return players.get(id)!;
  }

  const dbPlayer = await loadPlayer(id);

  if (dbPlayer) {
    players.set(id, dbPlayer);
    return dbPlayer;
  }

  const newPlayer: Player = {
    id,
    fuel: 100,
    cargo: [],
    signals: [],
    analyses: [],
  };

  players.set(id, newPlayer);
  await savePlayer(newPlayer);

  return newPlayer;
}

export async function persistPlayer(player: Player) {
  await savePlayer(player);
}
