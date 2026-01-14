/**************************************************
 * GLOBAL STATE
 **************************************************/
let currentPlayer = null;
let currentShip = null;

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
 * UTILS
 **************************************************/
function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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
 * SYSTEM OBJECTS
 **************************************************/
async function loadAndRenderSystemObjects(player) {
  console.log("🚀 loadAndRenderSystemObjects llamada", player);
  const container = document.getElementById("objects-container");
  container.innerHTML = "";

  const { data: objects } = await supabaseClient
    .from("space_objects")
    .select("*")
    .eq("system_id", player.system);

  if (!objects || objects.length === 0) {
    container.innerHTML = "<p>No hay objetos en este sistema</p>";
    return;
  }

  objects
    //.filter(o => canSee(player, o))
    .forEach(obj => {
      const dist = distance(player, obj);
      const interactable = canInteract(player, obj);

      const div = document.createElement("div");
      div.className = "object";

      console.log(
  "Jugador:", player.x, player.y,
  "Radar:", player.radar_range,
  "Objeto ejemplo:", objects[0].x, objects[0].y,
  "Distancia:", distance(player, objects[0])
);


      div.innerHTML = `
        <h3>${obj.type}</h3>
        <small>Recursos: ${obj.resources_remaining}</small>
        <div>📍 Distancia: ${Math.round(dist)}</div>
        <button ${interactable ? "" : "disabled"}>
          ${interactable ? "Interactuar" : "Fuera de alcance"}
        </button>
      `;

      if (interactable) {
        div.querySelector("button").onclick = () => interactWithObject(obj);
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
async function handleMove() {
  const x = parseInt(document.getElementById("move-x").value);
  const y = parseInt(document.getElementById("move-y").value);

  if (isNaN(x) || isNaN(y)) return alert("Coordenadas inválidas");
  moveTo(x, y);
}

async function moveTo(targetX, targetY) {
  if (currentPlayer.busy_until) {
    alert("La nave está viajando");
    return;
  }

  const dist = distance(currentPlayer, { x: targetX, y: targetY });
  const cost = Math.ceil(dist * BATTERY_COST_PER_UNIT);

  if (currentShip.battery_current < cost) {
    alert("Batería insuficiente");
    return;
  }

  const travelTime = dist * TIME_PER_UNIT;
  const busyUntil = new Date(Date.now() + travelTime).toISOString();

  await supabaseClient.from("ships")
    .update({ battery_current: currentShip.battery_current - cost })
    .eq("id", currentShip.id);

  await supabaseClient.from("players")
    .update({
      target_x: targetX,
      target_y: targetY,
      busy_until: busyUntil
    })
    .eq("id", currentPlayer.id);

  currentPlayer.busy_until = busyUntil;
  currentPlayer.target_x = targetX;
  currentPlayer.target_y = targetY;
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
    window.location.href = "createCharacter.html";
    return;
  }

// ⏱️ ¿Llegó a destino? if ( player.busy_until && new Date(player.busy_until) <= new Date() && player.target_x !== null ) { console.log("🛬 Viaje finalizado — finalizando en DB", { playerId: player.id, target_x: player.target_x, target_y: player.target_y, busy_until: player.busy_until });

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
  await loadAndRenderSystemObjects(player);

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
    `${ship.name} (${ship.type})`;

  updateBatteryBar(ship.battery_current, ship.battery_capacity);

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


