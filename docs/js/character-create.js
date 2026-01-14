let selectedRace = null;
let selectedShip = null;

document.addEventListener("DOMContentLoaded", () => {
  // RAZAS
  document.querySelectorAll("[data-race]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedRace = btn.dataset.race;
      highlightSelection(btn, "[data-race]");
    });
  });

  // NAVES
  document.querySelectorAll("[data-ship]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedShip = btn.dataset.ship;
      highlightSelection(btn, "[data-ship]");
    });
  });

  // CONFIRMAR
  document
    .getElementById("confirm-create")
    .addEventListener("click", createCharacter);
});

function highlightSelection(activeBtn, selector) {
  document.querySelectorAll(selector).forEach(b => {
    b.classList.remove("selected");
  });
  activeBtn.classList.add("selected");
}

async function createCharacter() {
  const name = document.getElementById("player-name").value.trim();

  if (!name || !selectedRace || !selectedShip) {
    alert("Completa nombre, raza y nave");
    return;
  }

  const { data: { session } } =
    await supabaseClient.auth.getSession();

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
