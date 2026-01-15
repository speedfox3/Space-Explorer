/**************************************************
 * GLOBAL STATE
 **************************************************/
let currentPlayer = null;
let currentShip = null;
let currentSystemObjects = [];

/**************************************************
 * CONSTANTS
 **************************************************/
const BATTERY_REGEN_INTERVAL = 10000;
const BATTERY_COST_PER_UNIT = 0.2;
const TIME_PER_UNIT = 1000;

/**************************************************
 * INIT
 **************************************************/
checkPlayer();

/**************************************************
 * TRAVEL TIMER
 **************************************************/
setInterval(async () => {
  if (!currentPlayer || !currentPlayer.busy_until) return;

  const now = new Date();
  const end = new Date(currentPlayer.busy_until);

  if (now >= end) {
    await finalizeTravel();
  } else {
    renderTravelStatus(currentPlayer);
  }
}, 1000);

/**************************************************
 * COORDENADA OCUPADA
 **************************************************/
function isOccupied(x, y) {
  const nx = Number(x);
  const ny = Number(y);
  return currentSystemObjects.some(o => Number(o.x) === nx && Number(o.y) === ny);
}

function findNearestFreeSpot(targetX, targetY, maxRadius = 20) {
  if (!isOccupied(targetX, targetY)) return { x: targetX, y: targetY };

  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      const candidates = [
        { x: targetX + dx, y: targetY - r },
        { x: targetX + dx, y: targetY + r },
      ];
      for (const c of candidates) {
        if (!isOccupied(c.x, c.y)) return c;
      }
    }
    for (let dy = -r + 1; dy <= r - 1; dy++) {
      const candidates = [
        { x: targetX - r, y: targetY + dy },
        { x: targetX + r, y: targetY + dy },
      ];
      for (const c of candidates) {
        if (!isOccupied(c.x, c.y)) return c;
      }
    }
  }
  return null; // todo ocupado dentro del radio
}

/**************************************************
 * MOVEMENT
 **************************************************/
async function moveTo(targetX, targetY) {
  // Normalizar inputs
  const tx = Number(targetX);
  const ty = Number(targetY);

  if (!Number.isFinite(tx) || !Number.isFinite(ty)) {
    alert("Coordenadas inválidas.");
    return;
  }

  // Si busy_until existe pero ya pasó, lo limpiamos
  if (currentPlayer.busy_until) {
    const busyMs = Date.parse(currentPlayer.busy_until);
    if (!Number.isNaN(busyMs) && Date.now() < busyMs) {
      alert("La nave está viajando");
      return;
    } else {
      // ya terminó: limpiar estado local (y opcionalmente en BD si querés)
      currentPlayer.busy_until = null;
      currentPlayer.target_x = null;
      currentPlayer.target_y = null;
    }
  }

  // Asegurar cache de objetos cargado (para colisiones)
  if (!currentSystemObjects || currentSystemObjects.length === 0) {
    await loadAndRenderSystemObjects(currentPlayer, currentShip);
  }

  // Resolver colisión (y normalizar salida)
  const resolved = findNearestFreeSpot(tx, ty, 30);
  if (!resolved) {
    alert("No hay espacio libre cerca de ese destino.");
    return;
  }

  const rx = Number(resolved.x);
  const ry = Number(resolved.y);

  if (rx !== tx || ry !== ty) {
    console.log(`Destino ocupado (${tx},${ty}). Reubicando a (${rx},${ry}).`);
  }

  const dist = distance(currentPlayer, { x: rx, y: ry });
  const cost = Math.ceil(dist * BATTERY_COST_PER_UNIT);

  if ((currentShip.battery_current ?? 0) < cost) {
    alert("Batería insuficiente");
    return;
  }

  const travelTime = Math.ceil(dist * TIME_PER_UNIT);
  const busyUntil = new Date(Date.now() + travelTime).toISOString();

  // Writes (ideal: con manejo de errores)
  const { error: shipErr } = await supabaseClient
    .from("ships")
    .update({ battery_current: currentShip.battery_current - cost })
    .eq("id", currentShip.id);

  if (shipErr) {
    console.error(shipErr);
    alert("Error actualizando batería: " + shipErr.message);
    return;
  }

  const { error: playerErr } = await supabaseClient
    .from("players")
    .update({ target_x: rx, target_y: ry, busy_until: busyUntil })
    .eq("id", currentPlayer.id);

  if (playerErr) {
    console.error(playerErr);
    alert("Error iniciando viaje: " + playerErr.message);
    return;
  }

  // Estado local
  currentShip.battery_current -= cost;
  currentPlayer.busy_until = busyUntil;
  currentPlayer.target_x = rx;
  currentPlayer.target_y = ry;

  renderTravelStatus(currentPlayer);
}



/**************************************************
 * UTILS
 **************************************************/
function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function canSee(player, ship, object) {
  const radar = ship.radar_range ?? 0;
  return distance(player, object) <= radar;
}


function canInteract(player, object) {
  return distance(player, object) <= 5;
}

function updateCargoBar(used, max) {
  const pct = max > 0 ? (used / max) * 100 : 0;
  document.getElementById("cargo-bar").style.width = pct + "%";
  document.getElementById("cargo-text").textContent = `${Math.round(pct)}%`;
}


/**************************************************
 * RADAR
 **************************************************/
function getEffectiveRadarRange(player, ship) {
  let range = ship?.radar_range ?? 0;

  // Ejemplos (dejalo listo para crecer):
  // - upgrade de radar
  range += ship?.radar_bonus_flat ?? 0;

  // - buff temporal
  if (ship?.radar_boost_until && Date.parse(ship.radar_boost_until) > Date.now()) {
    range *= 1.25;
  }

  // - daños afectan radar (ejemplo)
  const hullPct = (ship?.hull_current ?? 100) / (ship?.hull_capacity ?? 100);
  if (hullPct < 0.5) range *= 0.9;

  return Math.max(0, Math.floor(range));
}

function canSee(player, ship, object) {
  return distance(player, object) <= getEffectiveRadarRange(player, ship);
}

/**************************************************
 * BATTERY REGEN
 **************************************************/
function startBatteryRegen(shipId) {
  setInterval(async () => {
    const { data: ship } = await supabaseClient
      .from("ships")
      .select("battery_current, battery_capacity, battery_regen_rate")
      .eq("id", shipId)
      .single();

    if (!ship) return;

    if (ship.battery_current < ship.battery_capacity) {
      const value = Math.min(
        ship.battery_current + ship.battery_regen_rate,
        ship.battery_capacity
      );

      await supabaseClient
        .from("ships")
        .update({ battery_current: value })
        .eq("id", shipId);

      updateBatteryBar(value, ship.battery_capacity);
    }
  }, BATTERY_REGEN_INTERVAL);
}

function updateBatteryBar(current, max) {
  const pct = (current / max) * 100;
  document.getElementById("battery-bar").style.width = pct + "%";
  document.getElementById("battery-text").textContent = `${Math.round(pct)}%`;
}

/**************************************************
 * SHIELD BAR
 **************************************************/
function updateDefenseBar(ship) {
  const shieldMax = ship.shield_capacity ?? 0;
  const hullMax = ship.hull_capacity ?? 0;
  const shieldCur = ship.shield_current ?? 0;
  const hullCur = ship.hull_current ?? 0;

  const totalMax = shieldMax + hullMax;
  const totalCur = shieldCur + hullCur;
  const pct = totalMax > 0 ? (totalCur / totalMax) * 100 : 0;

  const bar = document.getElementById("defense-bar");
  bar.style.width = pct + "%";

  // Texto: "Escudo X/Y + Casco A/B"
  document.getElementById("defense-text").textContent =
    `S:${shieldCur}/${shieldMax} | H:${hullCur}/${hullMax}`;

  // Label
  document.getElementById("defense-label").textContent = "Defensa";

  // Color según escudo
  if (shieldCur > 0) {
    bar.style.background = "#3b82f6"; // azul
  } else {
    bar.style.background = "#ef4444"; // rojo
  }
}






/**************************************************
 * SYSTEM OBJECTS
 **************************************************/
async function loadAndRenderSystemObjects(player, ship) {
  console.log("🚀 loadAndRenderSystemObjects llamada", player);

  const container = document.getElementById("objects-container");
  container.innerHTML = "";

  const { data: objects, error } = await supabaseClient
    .from("space_objects")
    .select("*")
    .eq("system_id", player.system);

  if (error) {
    console.error("Error trayendo space_objects:", error);
    container.innerHTML = "<p>Error cargando objetos del sistema</p>";
    return;
  }

  // Cache global para colisiones / nearest-free-spot (IMPORTANTE para moveTo)
  currentSystemObjects = (objects ?? []).map(o => ({
    ...o,
    x: Number(o.x),
    y: Number(o.y),
    system_id: Number(o.system_id),
  }));

  if (!objects || objects.length === 0) {
    container.innerHTML = "<p>No hay objetos en este sistema</p>";
    return;
  }

  // 1) Visibles por radar ahora
  const radarRange = getEffectiveRadarRange(player, ship);
  const visibleNow = objects.filter(o => canSee(player, ship, o));

  // 2) Guardar descubrimientos (upsert) de lo visible
  //    (si no hay nada visible, igual seguimos para mostrar "descubiertos")
  if (visibleNow.length > 0) {
    const rows = visibleNow.map(o => ({
      player_id: player.id,
      object_id: o.id,
      last_seen_at: new Date().toISOString()
    }));

    const { error: upsertErr } = await supabaseClient
      .from("player_discovered_objects")
      .upsert(rows, { onConflict: "player_id,object_id" });

    if (upsertErr) {
      console.error("Error upsert descubrimientos:", upsertErr);
      // no cortamos: solo afecta UX
    }
  }

  // 3) Traer descubiertos del jugador (en este sistema)
  //    Tip: join a space_objects para traer datos del objeto
  const { data: discovered, error: discErr } = await supabaseClient
    .from("player_discovered_objects")
    .select("object_id, space_objects(*)")
    .eq("player_id", player.id);

  if (discErr) {
    console.error("Error trayendo descubiertos:", discErr);
    // seguimos igual, mostrando solo radar
  }

  // Filtrar solo los descubiertos de ESTE sistema (por si el jugador tiene de otros)
  const discoveredObjects = (discovered ?? [])
    .map(r => r.space_objects)
    .filter(o => o && Number(o.system_id) === Number(player.system));

  // 4) Separar descubiertos fuera de radar
  const visibleIds = new Set(visibleNow.map(o => o.id));
  const discoveredButNotVisible = discoveredObjects.filter(o => !visibleIds.has(o.id));

  // 5) Render
  const parts = [];

  // Sección Radar
  parts.push(`<h3>Detectados por radar (rango: ${radarRange})</h3>`);
  if (visibleNow.length === 0) {
    parts.push(`<p>No detectás nada ahora mismo.</p>`);
  } else {
    visibleNow.forEach(obj => parts.push(renderObjectCard(player, ship, obj, true)));
  }

  // Sección Descubiertos
  parts.push(`<h3>Descubiertos</h3>`);
  if (discoveredButNotVisible.length === 0) {
    parts.push(`<p>Aún no tenés objetos descubiertos fuera del radar.</p>`);
  } else {
    discoveredButNotVisible.forEach(obj => parts.push(renderObjectCard(player, ship, obj, false)));
  }

  container.innerHTML = parts.join("\n");

  // wire de botones interactuar
  // (busca todos los botones y conecta por data-id)
  container.querySelectorAll("button[data-obj-id]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-obj-id");
      const obj = objects.find(o => o.id === id) || discoveredObjects.find(o => o.id === id);
      if (obj) interactWithObject(obj);
    };
  });
}

/**************************************************
 * RENDER OBJETOS
 **************************************************/
function renderObjectCard(player, ship, obj, isVisibleNow) {
  const dist = distance(player, obj);
  const interactable = canInteract(player, obj);

  // gating por nivel (si todavía no existe, lo dejo preparado)
  const playerLevel = player.level ?? 1;
  const objLevel = obj.level ?? 1;
  const levelOk = playerLevel >= objLevel;

  // En “descubiertos fuera de radar” igual mostramos distancia aproximada real (con coords exactas)
  // (si preferís ocultar distancia cuando no está visible, lo cambiamos)
  const status = isVisibleNow ? "🟢 Radar" : "🟡 Descubierto";

  const disabledReason =
    !levelOk ? "Nivel insuficiente" :
    !interactable ? "Fuera de alcance" :
    "";

  const disabled = disabledReason ? "disabled" : "";

  return `
    <div class="object">
      <h3>${obj.type} <small>${status}</small></h3>
      <small>Nivel: ${objLevel}</small><br/>
      <small>Recursos: ${obj.resources_remaining ?? "-"}</small>
      <div>📍 Posición: X:${obj.x} | Y:${obj.y}</div>
      <div>📏 Distancia: ${Math.round(dist)}</div>
      <button data-obj-id="${obj.id}" ${disabled}>
        ${disabledReason ? disabledReason : "Interactuar"}
      </button>
    </div>
  `;
}

/**************************************************
 * INTERACTION
 **************************************************/
async function interactWithObject(object) {
  if (object.resources_remaining <= 0) return;

  await supabaseClient
    .from("space_objects")
    .update({
      resources_remaining: object.resources_remaining - 10
    })
    .eq("id", object.id);

  alert("Recolectaste recursos 🚀");
  checkPlayer();
}

/**************************************************
 * HANDLER MOVEMENT
 **************************************************/
async function handleMove() {
  const x = parseInt(document.getElementById("move-x").value);
  const y = parseInt(document.getElementById("move-y").value);

  if (isNaN(x) || isNaN(y)) return alert("Coordenadas inválidas");
  moveTo(x, y);

}

/**************************************************
 * TRAVEL FINALIZE
 **************************************************/
async function finalizeTravel() {
  await supabaseClient.from("players")
  
    .update({
      x: currentPlayer.target_x,
      y: currentPlayer.target_y,
      busy_until: null,
      target_x: null,
      target_y: null
    })
    .eq("id", currentPlayer.id);


  await checkPlayer();
  clearTravelStatus();
}

/**************************************************
 * TRAVEL UI
 **************************************************/
function renderTravelStatus(player) {
  const remaining = Math.ceil(
    (new Date(player.busy_until) - new Date()) / 1000
  );

  document.getElementById("travel-status").innerHTML =
    `🚀 Viajando — ${remaining}s`;

  document.getElementById("move-button").disabled = true;
}

function clearTravelStatus() {
  document.getElementById("travel-status").innerHTML = "";
  document.getElementById("move-button").disabled = false;
}

/**************************************************
 * PLAYER LOAD
 **************************************************/
async function checkPlayer() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const { data: player } = await supabaseClient
    .from("players")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!player) {
    window.location.href = "create-character.html";
    return;
  }

// ⏱️ ¿Llegó a destino? if ( player.busy_until && new Date(player.busy_until) <= new Date() && player.target_x !== null ) { g("🛬 Viaje finalizado — finalizando en DB", { playerId: player.id, target_x: player.target_x, target_y: player.target_y, busy_until: player.busy_until }console.lo);

const { data: updated, error } = await supabaseClient .from("players") .update({ x: player.target_x, y: player.target_y, busy_until: null, target_x: null, target_y: null }) .eq("id", player.id) .select() .maybeSingle();

if (error) { console.error("Error actualizando player al finalizar viaje:", error); // show to the user (optional) alert("Error al finalizar viaje (ver consola)."); return; }

console.log("Player actualizado tras viaje:", updated);

// volver a cargar estado real 
return checkPlayer(); }

  const { data: ship } = await supabaseClient
    .from("ships")
    .select("*")
    .eq("player_id", player.id)
    .single();

  currentPlayer = player;
  currentShip = ship;

  renderPlayer(player, ship);
  await loadAndRenderSystemObjects(player, ship);

  if (!window.__batteryRegenStarted) {
    startBatteryRegen(ship.id);
    window.__batteryRegenStarted = true;
  }
}

/**************************************************
 * RENDER PLAYER
 **************************************************/
function renderPlayer(player, ship) {
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("player-credits").textContent = player.credits;
  document.getElementById("player-location").textContent =
    `Sistema ${player.system}`;

  document.getElementById("ship-name").textContent =
    `${ship.ship_name} (${ship.type})`;

  updateBatteryBar(ship.battery_current, ship.battery_capacity);
  updateCargoBar(ship.cargo_used, ship.cargo_capacity);
  updateDefenseBar(ship);

  document.getElementById("player-coords").textContent =
    `X:${player.x} | Y:${player.y}`;

    
}


/**************************************************
 * LOGOUT
 **************************************************/
async function logout() {
  await supabaseClient.auth.signOut();
  location.href = "login.html";
}


