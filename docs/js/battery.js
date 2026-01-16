// battery.js
// Regeneracion automatica de bateria (cliente) con persistencia en Supabase.

import { supabaseClient } from "./supabase.js";
import { getCurrentShip, setCurrentShip } from "./state.js";
import { updateBatteryBar } from "./ui.js";

let regenIntervalId = null;

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

/**
 * Inicia un loop que recarga la bateria cada `tickMs`.
 * - Usa `ship.battery_regen_rate` (unidades por segundo) si existe; si no, `defaultRate`.
 * - Actualiza estado local + UI en cada tick.
 * - Persiste en Supabase (throttle) para no spamear la DB.
 */
export function startBatteryRegen({ tickMs = 1000, defaultRate = 2, persistEveryMs = 5000 } = {}) {
  if (regenIntervalId) return; // ya iniciado

  let lastPersistAt = 0;

  regenIntervalId = setInterval(async () => {
    const ship = getCurrentShip();
    if (!ship?.id) return;

    const cap = Number(ship.battery_capacity ?? 0);
    const cur = Number(ship.battery_current ?? 0);
    if (!Number.isFinite(cap) || cap <= 0) return;

    // Rate en unidades/seg. Permite float.
    const rate = Number(ship.battery_regen_rate ?? defaultRate);
    const delta = (Number.isFinite(rate) ? rate : defaultRate) * (tickMs / 1000);
    if (delta <= 0) return;

    const next = clamp(cur + delta, 0, cap);
    if (Math.floor(next) === Math.floor(cur) && next !== cap) {
      // Si delta es pequeño, igual actualizamos UI cuando cambie el entero.
      // Pero si no cambia, no hacemos nada para ahorrar trabajo.
      return;
    }

    const nextInt = Math.round(next);
    const newShip = { ...ship, battery_current: nextInt };
    setCurrentShip(newShip);
    updateBatteryBar(nextInt, cap);

    // Persistencia con throttle y solo si subio
    const now = Date.now();
    if (now - lastPersistAt < persistEveryMs) return;
    lastPersistAt = now;

    try {
      await supabaseClient
        .from("ships")
        .update({ battery_current: nextInt })
        .eq("id", ship.id);
    } catch (e) {
      // No cortamos el loop si falla la DB
      console.warn("battery regen: fallo persistencia", e);
    }
  }, tickMs);
}

export function stopBatteryRegen() {
  if (!regenIntervalId) return;
  clearInterval(regenIntervalId);
  regenIntervalId = null;
}
