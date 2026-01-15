// docs/js/character-create.js
import { supabaseClient } from "./supabase.js";

let selectedRace = null;
let selectedShip = null;

// UI helpers
function setSelected(containerSelector, attr, value) {
  const buttons = document.querySelectorAll(`${containerSelector} button[${attr}]`);
  buttons.forEach(b => b.classList.remove("selected"));

  const btn = document.querySelector(`${containerSelector} button[${attr}="${value}"]`);
  if (btn) btn.classList.add("selected");
}

async function ensureSessionOrRedirect() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

async function createCharacter() {
  const name = document.getElementById("player-name")?.value.trim();
  const shipName = document.getElementById("ship-name")?.value.trim();

  if (!name || !shipName || !selectedRace || !selectedShip) {
    alert("Completa nombre, nombre de nave, raza y nave");
    return;
  }

  const session = await ensureSessionOrRedirect();
  if (!session) return;

  // 1) Crear player
  const { error: playerError } = await supabaseClient
    .from("players")
    .insert({
      id: session.user.id,
      name,
      race: selectedRace,
      credits: 0,
      galaxy: 1,
      system: 1,
      x: 0,
      y: 0,
      busy_until: null,
      target_x: null,
      target_y: null
    });

  if (playerError) {
    console.error(playerError);
    alert("Error creando jugador: " + playerError.message);
    return;
  }

  // 2) Crear ship
  const shipStats = {
    scout:     { engine: 5, battery: 300, cargo: 15, shield: 80,  hull: 90,  regen: 2, radar: 12 },
    freighter: { engine: 2, battery: 600, cargo: 40, shield: 120, hull: 200, regen: 2, radar: 8  },
    explorer:  { engine: 4, battery: 500, cargo: 25, shield: 100, hull: 120, regen: 2, radar: 10 }
  };

  const s = shipStats[selectedShip];

  const { error: shipError } = await supabaseClient
    .from("ships")
    .insert({
      player_id: session.user.id,
      type: selectedShip,
      engine_power: s.engine,
      battery_capacity: s.battery,
      battery_current: s.battery,
      cargo_capacity: s.cargo,
      cargo_used: 0,
      shield_capacity: s.shield,
      shield_current: s.shield,
      hull_capacity: s.hull,
      hull_current: s.hull,
      radar_range: s.radar,
      battery_regen_rate: s.regen,
      ship_name: shipName
    });

  if (shipError) {
    console.error(shipError);
    alert("Error creando nave: " + shipError.message);
    return;
  }

  window.location.href = "index.html";
}

function bindUI() {
  // seleccionar raza
  document.querySelectorAll('.options button[data-race]').forEach(btn => {
    btn.addEventListener("click", () => {
      selectedRace = btn.dataset.race;
      setSelected(".options", "data-race", selectedRace);
    });
  });

  // seleccionar nave
  document.querySelectorAll('.options button[data-ship]').forEach(btn => {
    btn.addEventListener("click", () => {
      selectedShip = btn.dataset.ship;
      setSelected(".options", "data-ship", selectedShip);
    });
  });

  // crear
  document.getElementById("confirm-create")?.addEventListener("click", createCharacter);

  // logout
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  });
}

async function init() {
  // si no hay sesión, afuera
  const session = await ensureSessionOrRedirect();
  if (!session) return;

  bindUI();
}

init();
