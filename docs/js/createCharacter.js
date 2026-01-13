async function createCharacter() {
  const name = document.getElementById("player-name").value;
  if (!name || !selectedRace || !selectedShip) {
    alert("Completa todos los campos");
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Crear player
  await supabaseClient.from("players").insert({
    id: session.user.id,
    name,
    race: selectedRace
  });

  // Stats iniciales según nave
  const shipStats = {
    scout: { engine: 5, battery: 3 },
    freighter: { engine: 2, battery: 6 },
    explorer: { engine: 4, battery: 4 }
  };

  await supabaseClient.from("ships").insert({
    player_id: session.user.id,
    type: selectedShip,
    engine_power: shipStats[selectedShip].engine,
    battery_capacity: shipStats[selectedShip].battery
  });

  window.location.href = "index.html";
}

document
  .getElementById("confirm-create")
  .onclick = createCharacter;
