// balance.js
import { distance } from "./math.js";

// defaults (si ya tenías constantes en game.js, ponelas acá)
export const BATTERY_COST_PER_UNIT = 1; // ajustá a tu balance real
export const TIME_PER_UNIT = 1000;      // ms por unidad (1s). Ajustá si usabas otra escala.

export function getEffectiveRadarRange(player, ship) {
  let range = ship?.radar_range ?? 0;

  // bonus flat por mejoras
  range += ship?.radar_bonus_flat ?? 0;

  // buff temporal ejemplo
  if (ship?.radar_boost_until && Date.parse(ship.radar_boost_until) > Date.now()) {
    range *= 1.25;
  }

  // daño afecta sensores (ejemplo)
  const hullPct = (ship?.hull_current ?? 100) / (ship?.hull_capacity ?? 100);
  if (hullPct < 0.5) range *= 0.9;

  return Math.max(0, Math.floor(range));
}

export function canSee(player, ship, object) {
  return distance(player, object) <= getEffectiveRadarRange(player, ship);
}

export function canInteract(player, object) {
  // tu regla actual: <= 5 casillas
  return distance(player, object) <= 5;
}
