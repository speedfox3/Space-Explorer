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
  const pct = (current / max) * 100;
  document.getElementById("battery-bar").style.width = pct + "%";
  document.getElementById("battery-text").textContent = `${Math.round(pct)}%`;


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

  console.log("> moveTo: updating DB", { shipId: currentShip.id, playerId: currentPlayer.id, cost, targetX, targetY, busyUntil });

  const shipRes = await supabaseClient.from("ships")
    .update({ battery_current: currentShip.battery_current - cost })
    .eq("id", currentShip.id);
  if (shipRes.error) {
    console.error("moveTo: failed updating ship battery", shipRes.error);
    alert("Error updating ship battery. Check console.");
    return;
  }

  const playerRes = await supabaseClient.from("players")
    .update({
      target_x: targetX,
      target_y: targetY,
      busy_until: busyUntil
    })
    .eq("id", currentPlayer.id);
  if (playerRes.error) {
    console.error("moveTo: failed updating player travel info", playerRes.error);
    alert("Error starting travel. Check console.");
    return;
  }

  console.log("< moveTo: DB updated", { shipRes, playerRes });

  currentPlayer.busy_until = busyUntil;
  currentPlayer.target_x = targetX;
  currentPlayer.target_y = targetY;
}

/**************************************************
 * TRAVEL FINALIZE
 **************************************************/
async function finalizeTravel() {
  try {
    console.log("> finalizeTravel: applying arrival", { playerId: currentPlayer.id, target_x: currentPlayer.target_x, target_y: currentPlayer.target_y });
    const res = await supabaseClient.from("players")
      .update({
        x: currentPlayer.target_x,
        y: currentPlayer.target_y,
        busy_until: null,
        target_x: null,
        target_y: null
      })
      .eq("id", currentPlayer.id);

    if (res.error) {
      console.error("finalizeTravel: update failed", res.error);
      return;
    }

    console.log("< finalizeTravel: arrival applied", res);
    await checkPlayer();
    clearTravelStatus();
  } catch (e) {
    console.error("finalizeTravel: unexpected error", e);
  }
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

  // ⏱️ ¿Llegó a destino?
  if (
    player.busy_until &&
    new Date(player.busy_until) <= new Date() &&
    player.target_x !== null
  ) {
    console.log("🛬 Viaje finalizado (auto-check)");
    try {
      // fetch latest player state from DB to avoid stale local object
      const { data: latestPlayer, error: fetchErr } = await supabaseClient
        .from("players")
        .select("*")
        .eq("id", player.id)
        .single();

      if (fetchErr) {
        console.error("auto-finalize: could not fetch latest player", fetchErr);
        return;
      }

      console.log("auto-finalize: latestPlayer", latestPlayer);

      const upd = await supabaseClient
        .from("players")
        .update({
          x: latestPlayer.target_x,
          y: latestPlayer.target_y,
          busy_until: null,
          target_x: null,
          target_y: null
        })
        .eq("id", player.id);

      if (upd.error) {
        console.error("auto-finalize: update failed", upd.error);
      } else {
        console.log("auto-finalize: update result", upd);
      }

      // reload real state
      return checkPlayer();
    } catch (e) {
      console.error("auto-finalize: unexpected error", e);
    }
  }

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