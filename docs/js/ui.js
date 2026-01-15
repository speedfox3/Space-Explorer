// ui.js
export function updateBatteryBar(current, max) {
  const bar = document.getElementById("battery-bar");
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((current / max) * 100))) : 0;
  if (bar) bar.style.width = pct + "%";
  const label = document.getElementById("battery-label");
  if (label) label.textContent = `${pct}%`;
}

export function updateCargoBar(used, capacity) {
  const bar = document.getElementById("cargo-bar");
  const pct = capacity > 0 ? Math.max(0, Math.min(100, Math.round((used / capacity) * 100))) : 0;
  if (bar) bar.style.width = pct + "%";
  const label = document.getElementById("cargo-label");
  if (label) label.textContent = `${pct}%`;
}

export function updateDefenseBar(ship) {
  // En tu UI querías "S: x/y | H: x/y" + color según escudo/hull.
  // Dejo el texto y vos podés mejorar estilos con CSS.
  const label = document.getElementById("defense-label");
  if (!label) return;

  const sc = ship?.shield_current ?? 0;
  const sm = ship?.shield_capacity ?? 0;
  const hc = ship?.hull_current ?? 0;
  const hm = ship?.hull_capacity ?? 0;

  label.textContent = `S:${sc}/${sm} | H:${hc}/${hm}`;

  // Color: si hay escudo >0 verde, si no naranja/rojo según hull
  if (sc > 0) label.dataset.state = "shield";
  else if (hm > 0 && (hc / hm) < 0.3) label.dataset.state = "critical";
  else label.dataset.state = "hull";
}

export function setMoveInputsFromPlayer(player) {
  // OJO: tus inputs se llaman move-x / move-y en tu HTML actual
  const xInput = document.getElementById("move-x");
  const yInput = document.getElementById("move-y");
  if (!xInput || !yInput) return;

  const busyMs = player?.busy_until ? Date.parse(player.busy_until) : NaN;
  const isTraveling = Number.isFinite(busyMs) && Date.now() < busyMs;

  const x = isTraveling ? (player.target_x ?? player.x) : player.x;
  const y = isTraveling ? (player.target_y ?? player.y) : player.y;

  xInput.value = (x ?? 0);
  yInput.value = (y ?? 0);
}

export function renderPlayer(player, ship) {
  document.getElementById("player-name").textContent = player.name ?? "-";
  document.getElementById("player-credits").textContent = player.credits ?? 0;
  document.getElementById("player-location").textContent = `Sistema ${player.system ?? "-"}`;

  document.getElementById("ship-name").textContent = `${ship?.ship_name ?? "-"} (${ship?.type ?? "-"})`;

  updateBatteryBar(ship?.battery_current ?? 0, ship?.battery_capacity ?? 0);
  updateCargoBar(ship?.cargo_used ?? 0, ship?.cargo_capacity ?? 0);
  updateDefenseBar(ship);

  document.getElementById("player-coords").textContent = `X:${player.x ?? 0} | Y:${player.y ?? 0}`;

  setMoveInputsFromPlayer(player);
}

export function renderTravelStatus(player) {
  const el = document.getElementById("travel-status");
  if (!el) return;

  if (!player?.busy_until) {
    el.textContent = "";
    return;
  }

  const busyMs = Date.parse(player.busy_until);
  if (!Number.isFinite(busyMs)) {
    el.textContent = "";
    return;
  }

  const remaining = Math.max(0, busyMs - Date.now());
  const sec = Math.ceil(remaining / 1000);
  el.textContent = `Viajando... ${sec}s`;
}

export function clearTravelStatus() {
  const el = document.getElementById("travel-status");
  if (el) el.textContent = "";
}
