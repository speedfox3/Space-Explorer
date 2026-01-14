const SYSTEM_OBJECTS = [
  {
    id: "planet_mineral",
    name: "Planeta Ígneo",
    description: "Rico en minerales",
    action: "travel",
    time: 15,
    energy: 40
  },
  {
    id: "asteroid_belt",
    name: "Cinturón de Asteroides",
    description: "Minería básica",
    action: "explore",
    time: 8,
    energy: 20
  },
  {
    id: "abandoned_station",
    name: "Estación Abandonada",
    description: "Mini-juego de saqueo",
    action: "loot",
    time: 25,
    energy: 60
  }
];

function renderSystemObjects(player) {
  const container = document.getElementById("objects-container");
  container.innerHTML = "";

  SYSTEM_OBJECTS.forEach(obj => {
    const disabled = player.energy < obj.energy;

    const div = document.createElement("div");
    div.className = "object";

    div.innerHTML = `
      <h3>${obj.name}</h3>
      <small>${obj.description}</small>
      <div class="cost">⏱ ${obj.time} min • ⚡ ${obj.energy} energía</div>
      <button ${disabled ? "disabled" : ""}>
        ${disabled ? "Energía insuficiente" : "Interactuar"}
      </button>
    `;

    if (!disabled) {
      div.querySelector("button").onclick = () =>
        startAction(obj, player);
    }

    container.appendChild(div);
  });
}


async function startAction(object, player) {
  const now = new Date();
  const busyUntil = new Date(
    now.getTime() + object.time * 60000
  );

  // Actualizar jugador
  await supabaseClient.from("players")
    .update({
      energy: player.energy - object.energy,
      busy_until: busyUntil.toISOString()
    })
    .eq("id", player.id);

  alert(
    `Acción iniciada: ${object.name}\n` +
    `Duración: ${object.time} minutos`
  );

  checkPlayer(); // recargar estado
}


function updateGameState(player) {
  const now = new Date();

  if (player.busy_until && new Date(player.busy_until) > now) {
    renderBusyState(player);
  } else {
    renderSystemObjects(player);
  }
}


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

  renderPlayer(player, ship);
}

function renderPlayer(player, ship) {
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("player-credits").textContent = player.credits;
  document.getElementById("player-location").textContent =
    `Galaxia ${player.galaxy} • Sistema ${player.system}`;

  document.getElementById("ship-name").textContent =
    `${ship.name} (${ship.type})`;

  document.getElementById("engine-bar").style.width =
    (ship.engine_power * 10) + "%";

  document.getElementById("battery-bar").style.width =
    (ship.battery_capacity * 10) + "%";

  document.getElementById("system-name").textContent =
    `Sistema ${player.system}`;

  document.getElementById("galaxy-name").textContent =
    `Galaxia ${player.galaxy}`;
}

checkPlayer();
updateGameState(player); // 
