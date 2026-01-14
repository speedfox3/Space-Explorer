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

