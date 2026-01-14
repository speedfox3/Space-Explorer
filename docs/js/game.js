/**************************************************
 * GLOBAL STATE
 **************************************************/
let currentPlayer = null;
let currentShip = null;

/**************************************************
 * CONSTANTS
 **************************************************/
const BATTERY_REGEN_INTERVAL = 10000; // 10s
const BATTERY_COST_PER_UNIT = 0.2;
const TIME_PER_UNIT = 1000; // ms por unidad

/**************************************************
 * INIT
 **************************************************/
checkPlayer();

/**************************************************
 * UTILS
 **************************************************/
function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2)
  );
}

function canSee(player, object) {
  return distance(player, object) <= player.radar_range;
}

function canInteract(player, object) {
  return distance(player, object) <= 5;
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
      const newValue = Math.min(
        ship.battery_current + ship.battery_regen_rate,
        ship.battery_capacity
      );

      await supabaseClient
        .from("ships")
        .update({ battery_current: newValue })
        .eq("id", shipId);

      updateBatteryBar(newValue, ship.battery_capacity);
    }
  }, BATTERY_REGEN_INTERVAL);
}

function updateBatteryBar(current, max) {
  const pct = (current / max) * 100;
  document.getElementById("battery-bar").style.width = pct + "%";
  document.getElementById("battery-text").textContent =
    `${Math.round(pct)}%`;
}

/**************************************************
 * GAME STATE
 **************************************************/
function updateGameState(player) {
  const now = new Date();

  if (player.busy_until && new Date(player.busy_until) > now) {
    renderBusyState(player);
  } else {
    loadAndRenderSystemObjects(player);
  }
}

/**************************************************
 * SYSTEM OBJECTS
 **************************************************/
async function loadAndRenderSystemObjects(player) {
  const container = document.getElementById("objects-container");
  if (!container) return;

  container.innerHTML = "";

  const { data: objects } = await supabaseClient
    .from("space_objects")
    .select("*")
    .eq("system_id", player.system);

  if (!objects) return;

  const visible = objects.filter(o => canSee(player, o));

  visible.forEach(obj => {
    const dist = distance(player, obj);
    const interactable = canInteract(player, obj);

    const div = document.createElement("div");
    div.className = "object";

    div.innerHTML = `
      <h3>${obj.type} (Nivel ${obj.level})</h3>
      <small>Recursos: ${obj.resources_remaining}</small>
      <div class="cost">📍 Distancia: ${Math.round(dist)}</div>
      <button ${interactable ? "" : "disabled"}>
        ${interactable ? "Interactuar" : "Fuera de alcance"}
      </button>
    `;

    if (interactable) {
      div.querySelector("button").onclick = () =>
        interactWithObject(obj);
    }

    container.appendChild(div);
  });
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
 * MOVEMENT
 **************************************************/
async function moveTo(targetX, targetY) {
  if (!currentPlayer || !currentShip) return;

  if (
    currentPlayer.busy_until &&
    new Date(currentPlayer.busy_until) > new Date()
  ) {
    alert("La nave está ocupada");
    return;
  }

  const from = { x: currentPlayer.x, y: currentPlayer.y };
  const to = { x: targetX, y: targetY };

  const dist = distance(from, to);
  const batteryCost = Math.ceil(dist * BATTERY_COST_PER_UNIT);

  if (currentShip.battery_current < batteryCost) {
    alert("Batería insuficiente");
    return;
  }

  const travelTime = dist * TIME_PER_UNIT;
  const busyUntil = new Date(Date.now() + travelTime);

  await supabaseClient
    .from("ships")
    .update({
      battery_current: currentShip.battery_current - batteryCost
    })
    .eq("id", currentShip.id);

  await supabaseClient
    .from("players")
    .update({
      x: targetX,
      y: targetY,
      busy_until: busyUntil.toISOString()
    })
    .eq("id", currentPlayer.id);

  await showTravelModal(dist, travelTime);
  checkPlayer();
}

function handleMove() {
  const x = parseInt(document.getElementById("move-x").value);
  const y = parseInt(document.getElementById("move-y").value);

  if (isNaN(x) || isNaN(y)) {
    alert("Coordenadas inválidas");
    return;
  }

  moveTo(x, y);
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
    window.location.href = "createCharacter.html";
    return;
  }

  await supabaseClient.rpc("ensure_space_objects", {
  p_system: player.system
});

  const { data: ship } = await supabaseClient
    .from("ships")
    .select("*")
    .eq("player_id", player.id)
    .single();

  currentPlayer = player;
  currentShip = ship;

  renderPlayer(player, ship);
  updateGameState(player);

  if (!window.__batteryRegenStarted) {
    startBatteryRegen(ship.id);
    window.__batteryRegenStarted = true;
  }
}

/**************************************************
 * RENDER PLAYER + SHIP
 **************************************************/
function renderPlayer(player, ship) {
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("player-credits").textContent = player.credits;
  document.getElementById("player-location").textContent =
    `Galaxia ${player.galaxy} • Sistema ${player.system}`;

  document.getElementById("ship-name").textContent =
    `${ship.name} (${ship.type})`;

  updateBatteryBar(
    ship.battery_current,
    ship.battery_capacity
  );

  const coordEl = document.getElementById("player-coords");
if (coordEl) {
  coordEl.textContent = `X: ${player.x} | Y: ${player.y}`;
}

  const cargoPct =
    (ship.cargo_used / ship.cargo_capacity) * 100;
  document.getElementById("cargo-bar").style.width = cargoPct + "%";
  document.getElementById("cargo-text").textContent =
    `${ship.cargo_used} / ${ship.cargo_capacity}`;

  if (ship.shield_max > 0) {
    const shieldPct =
      (ship.shield_current / ship.shield_max) * 100;
    document.getElementById("defense-label").textContent = "Escudos";
    document.getElementById("defense-bar").style.width = shieldPct + "%";
    document.getElementById("defense-text").textContent =
      `${Math.round(shieldPct)}%`;
  } else {
    const hullPct =
      (ship.hull_current / ship.hull_max) * 100;
    document.getElementById("defense-label").textContent = "Integridad";
    document.getElementById("defense-bar").style.width = hullPct + "%";
    document.getElementById("defense-text").textContent =
      `${Math.round(hullPct)}%`;
  }
}

/**************************************************
 * BUSY STATE
 **************************************************/
function renderBusyState(player) {
  const container = document.getElementById("objects-container");
  if (!container) return;

  container.innerHTML = `
    <div class="busy">
      ⏳ Nave ocupada<br>
      Disponible en: ${new Date(player.busy_until).toLocaleTimeString()}
    </div>
  `;
}

/**************************************************
 * LOGOUT
 **************************************************/
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}


/**************************************************
 * Mostrar tiempo de viaje
 **************************************************/
function showTravelModal(dist, travelTimeMs) {
  return new Promise(resolve => {
    const modal = document.createElement("div");
    modal.className = "travel-modal";

    let remaining = Math.ceil(travelTimeMs / 1000);

    modal.innerHTML = `
      <div class="travel-box">
        <h3>🚀 Nave en movimiento</h3>
        <p>Distancia: ${Math.round(dist)}</p>
        <p id="travel-timer">Tiempo restante: ${remaining}s</p>
        <button id="travel-ok" disabled>En viaje...</button>
      </div>
    `;

    document.body.appendChild(modal);

    const timerEl = modal.querySelector("#travel-timer");
    const btn = modal.querySelector("#travel-ok");

    const interval = setInterval(() => {
      remaining--;
      timerEl.textContent = `Tiempo restante: ${remaining}s`;

      if (remaining <= 0) {
        clearInterval(interval);
        btn.disabled = false;
        btn.textContent = "Llegaste";
      }
    }, 1000);

    btn.onclick = () => {
      modal.remove();
      resolve();
    };
  });
}
