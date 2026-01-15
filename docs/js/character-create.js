async function createCharacter() {
  const name = document.getElementById("player-name").value.trim();
  const shipName = document.getElementById("ship-name").value.trim();

  if (!name || !shipName || !selectedRace || !selectedShip) {
    alert("Completa nombre, nombre de nave, raza y nave");
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // 1) Crear player (con defaults útiles)
  const { error: playerError } = await supabaseClient.from("players").insert({
    id: session.user.id,
    name,
    race: selectedRace,
    credits: 0,
    system: 1,
    x: 0,
    y: 0,
    radar_range: 50
  });

  if (playerError) {
    console.error(playerError);
    alert("Error creando jugador: " + playerError.message);
    return;
  }

  // 2) Crear ship
  const shipStats = {
    scout:    { engine: 5, battery: 3, cargo: 15, shield: 10, hull: 12, regen: 1 },
    freighter:{ engine: 2, battery: 6, cargo: 40, shield: 12, hull: 20, regen: 1 },
    explorer: { engine: 4, battery: 4, cargo: 25, shield: 14, hull: 16, regen: 1 }
  };

  const s = shipStats[selectedShip];

  const { error: shipError } = await supabaseClient.from("ships").insert({
    player_id: session.user.id,
    name: shipName,
    type: selectedShip,
    engine_power: s.engine,
    battery_capacity: s.battery,
    cargo_capacity: s.cargo,
    shield_capacity: s.shield,
    hull_capacity: s.hull,
    battery_current: s.battery,
    shield_current: s.shield,
    hull_current: s.hull,
    battery_regen_rate: s.regen
  });

  if (shipError) {
    console.error(shipError);
    alert("Error creando nave: " + shipError.message);
    return;
  }

  window.location.href = "index.html";
}
