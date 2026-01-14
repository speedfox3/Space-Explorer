/**************************************************
 * CONSTANTS
 **************************************************/
const BATTERY_REGEN_INTERVAL = 10000; // 10 segundos

let currentPlayer = null;
let currentShip = null;
let batteryRegenTimer = null;

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
 * BATTERY REGEN (SHIP ONLY)
 **************************************************/
function startBatteryRegen(shipId) {
  if (batteryRegenTimer) return; // evitar duplicados

  batteryRegenTimer = setInterval(async () => {
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
  const bar = document.getElementById("battery-bar");
  const text = document.getElementById("battery-text");

  if (!bar || !text) return;

  const pct = (current / max) * 100;
  bar.style.width = pct + "%";
  text.textContent = `${Math.round(pct)}%`;
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
 * SYSTEM OBJECTS (DINÁMICOS)
 **************************************************/
async function loadAndRenderSystemObjects(player) {
  const container = document.getElementById("objects-container");
  container.innerHTML = "";

  const { data: objects } = await supabaseClient
    .from("space_objects")
    .select("*")
    .eq("system_id", player.system);

  if (!objects) return;

  const visibleObjects = objects.filter(o => canSee(player, o));

  visibleObjects.forEach(obj => {
    const interactable = canInteract(player, obj);

    const div = document.createElement("div");
    div.className = "object";

    div.innerHTML = `
      <h3>${obj.type} (Nivel ${obj.level})</h3>
      <small>Recursos: ${obj.resources_remaining}</small>
      <div class="cost">
        📍 Distancia: ${Math.round(distance(player, obj))}
      </div>
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

  const { data: ship } = await supabaseClient
    .from("ships")
    .select("*")
    .eq("player_id", player.id)
    .single();

  currentPlayer = player;
  currentShip = ship;

  renderPlayer(player, ship);
  updateGameState(player);

  startBatteryRegen(ship.id);
}

/**************************************************
 * RENDER PLAYER + SHIP
 **************************************************/
function renderPlayer(player, ship) {
  // 👤 Player
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("player-credits").textContent = player.credits;
  document.getElementById("player-location").textContent =
    `Galaxia ${player.galaxy} • Sistema ${player.system}`;

  // 🚀 Ship
  document.getElementById("ship-name").textContent =
    `${ship.name} (${ship.type})`;

  // 🔋 Baterías
  updateBatteryBar(ship.battery_current, ship.battery_capacity);

  // 📦 Carga
  const cargoPct =
    (ship.cargo_used / ship.cargo_capacity) * 100;
  document.getElementById("cargo-bar").style.width = cargoPct + "%";
  document.getElementById("cargo-text").textContent =
    `${ship.cargo_used} / ${ship.cargo_capacity}`;

  // 🛡️ Escudos / ❤️ Vida
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
