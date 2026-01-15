// movement.js
import { supabaseClient } from "./supabase.js";
import { distance } from "./math.js";
import { BATTERY_COST_PER_UNIT, TIME_PER_UNIT } from "./balance.js";
import { getCurrentPlayer, getCurrentShip, getCurrentSystemObjects, setCurrentPlayer, setCurrentShip } from "./state.js";
import { renderTravelStatus, clearTravelStatus } from "./ui.js";
import { loadAndRenderSystemObjects } from "./world.js";

function isOccupied(x, y) {
  const nx = Number(x), ny = Number(y);
  const objs = getCurrentSystemObjects();
  return (objs ?? []).some(o => Number(o.x) === nx && Number(o.y) === ny);
}

function findNearestFreeSpot(targetX, targetY, maxRadius = 30) {
  const tx = Number(targetX), ty = Number(targetY);
  if (!Number.isFinite(tx) || !Number.isFinite(ty)) return null;

  if (!isOccupied(tx, ty)) return { x: tx, y: ty };

  // BFS simple en anillos
  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      const candidates = [
        { x: tx + dx, y: ty - r },
        { x: tx + dx, y: ty + r },
      ];
      for (const c of candidates) if (!isOccupied(c.x, c.y)) return c;
    }
    for (let dy = -r + 1; dy <= r - 1; dy++) {
      const candidates = [
        { x: tx - r, y: ty + dy },
        { x: tx + r, y: ty + dy },
      ];
      for (const c of candidates) if (!isOccupied(c.x, c.y)) return c;
    }
  }
  return null;
}

export async function moveTo(targetX, targetY) {
  const currentPlayer = getCurrentPlayer();
  const currentShip = getCurrentShip();

  const tx = Number(targetX);
  const ty = Number(targetY);
  if (!Number.isFinite(tx) || !Number.isFinite(ty)) {
    alert("Coordenadas inválidas.");
    return;
  }

  // Asegurar objetos cargados para colisiones
  if (!getCurrentSystemObjects() || getCurrentSystemObjects().length === 0) {
    await loadAndRenderSystemObjects(currentPlayer, currentShip);
  }

  // Si está viajando y aún no llegó, bloquear
  if (currentPlayer?.busy_until) {
    const busyMs = Date.parse(currentPlayer.busy_until);
    if (Number.isFinite(busyMs) && Date.now() < busyMs) {
      alert("La nave está viajando");
      return;
    }
  }

  const resolved = findNearestFreeSpot(tx, ty, 30);
  if (!resolved) {
    alert("No hay espacio libre cerca de ese destino.");
    return;
  }

  const dist = distance(currentPlayer, resolved);
  const cost = Math.ceil(dist * BATTERY_COST_PER_UNIT);

  if ((currentShip?.battery_current ?? 0) < cost) {
    alert("Batería insuficiente");
    return;
  }

  const travelTimeMs = Math.ceil(dist * TIME_PER_UNIT);
  const busyUntil = new Date(Date.now() + travelTimeMs).toISOString();

  const { error: shipErr } = await supabaseClient
    .from("ships")
    .update({ battery_current: currentShip.battery_current - cost })
    .eq("id", currentShip.id);

  if (shipErr) {
    console.error(shipErr);
    alert("Error actualizando batería");
    return;
  }

  const { error: playerErr } = await supabaseClient
    .from("players")
    .update({
      target_x: resolved.x,
      target_y: resolved.y,
      busy_until: busyUntil
    })
    .eq("id", currentPlayer.id);

  if (playerErr) {
    console.error(playerErr);
    alert("Error iniciando viaje");
    return;
  }

  // Estado local
  const newShip = { ...currentShip, battery_current: currentShip.battery_current - cost };
  const newPlayer = { ...currentPlayer, busy_until: busyUntil, target_x: resolved.x, target_y: resolved.y };

  setCurrentShip(newShip);
  setCurrentPlayer(newPlayer);

  renderTravelStatus(newPlayer);
}

export async function finalizeTravel() {
  const currentPlayer = getCurrentPlayer();
  const currentShip = getCurrentShip();
  if (!currentPlayer) return;

  const busyMs = currentPlayer.busy_until ? Date.parse(currentPlayer.busy_until) : NaN;
  if (!Number.isFinite(busyMs) || Date.now() < busyMs) return;

  const tx = Number(currentPlayer.target_x);
  const ty = Number(currentPlayer.target_y);

  // Si target inválido, NO tocar x/y
  if (!Number.isFinite(tx) || !Number.isFinite(ty)) {
    console.warn("finalizeTravel: target inválido, limpiando viaje");
    await supabaseClient
      .from("players")
      .update({ busy_until: null, target_x: null, target_y: null })
      .eq("id", currentPlayer.id);

    setCurrentPlayer({ ...currentPlayer, busy_until: null, target_x: null, target_y: null });
    clearTravelStatus();
    return;
  }

  const { error } = await supabaseClient
    .from("players")
    .update({
      x: tx,
      y: ty,
      busy_until: null,
      target_x: null,
      target_y: null
    })
    .eq("id", currentPlayer.id);

  if (error) {
    console.error("Error finalizando viaje:", error);
    return;
  }

  setCurrentPlayer({ ...currentPlayer, x: tx, y: ty, busy_until: null, target_x: null, target_y: null });
  clearTravelStatus();

  // refrescar objetos (por si el radar cambia al moverse)
  if (currentShip) {
    await loadAndRenderSystemObjects(getCurrentPlayer(), currentShip);
  }
}

export function startTravelTimer() {
  setInterval(async () => {
    const p = getCurrentPlayer();
    if (!p?.busy_until) return;

    const busyMs = Date.parse(p.busy_until);
    if (!Number.isFinite(busyMs)) return;

    if (Date.now() >= busyMs) {
      await finalizeTravel();
    } else {
      renderTravelStatus(p);
    }
  }, 1000);
}

export function handleMoveClick() {
  const x = Number(document.getElementById("move-x")?.value);
  const y = Number(document.getElementById("move-y")?.value);
  moveTo(x, y);
}
