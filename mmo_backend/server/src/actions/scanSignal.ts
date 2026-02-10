import { Player } from '../models/player.js';
import { persistPlayer } from '../state/gameState.js';
import { generateSignal } from '../game/signalGenerator.js';

export const SCAN_TICKS = 5;
export const SCAN_FUEL_COST = 5;

export function startScan(player: Player) {
  if (player.currentAction) {
    throw new Error('Player already has an active action');
  }

  if (player.fuel < SCAN_FUEL_COST) {
    throw new Error('Not enough fuel');
  }

  player.fuel -= SCAN_FUEL_COST;

  player.currentAction = {
    type: 'scan_signal',
    remainingTicks: SCAN_TICKS,
  };
}

export async function resolveScan(player: Player) {
  const signal = generateSignal();
  player.signals.push(signal);

  player.currentAction = undefined;
  await persistPlayer(player);
}