// main.js
import { supabaseClient } from "./supabase.js";
import { setCurrentPlayer, setCurrentShip, getCurrentPlayer } from "./state.js";
import { renderPlayer } from "./ui.js";
import { loadAndRenderSystemObjects } from "./world.js";
import { handleMoveClick, startTravelTimer } from "./movement.js";

// Si tenés startBatteryRegen en tu game.js actual, muévelo a otro archivo (regen.js)
// y lo importás acá. Por ahora lo dejo opcional.
import { startBatteryRegen } from "./regen.js"; // si no existe aún, comentá esta línea

async function checkPlayer() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const { data: player, error: playerErr } = await supabaseClient
    .from("players")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (playerErr) console.error(playerErr);

  if (!player) {
    window.location.href = "create-character.html";
    return;
  }

  // ⏱️ Finalizar viaje si ya llegó (robusto ante F5)
  if (player.busy_until) {
    const busyMs = Date.parse(player.busy_until);
    const arrived = Number.isFinite(busyMs) && Date.now() >= busyMs;

    if (arrived) {
      const tx = Number(player.target_x);
      const ty = Number(player.target_y);

      if (Number.isFinite(tx) && Number.isFinite(ty)) {
        await supabaseClient
          .from("players")
          .update({ x: tx, y: ty, busy_until: null, target_x: null, target_y: null })
          .eq("id", player.id);
      } else {
        await supabaseClient
          .from("players")
          .update({ busy_until: null, target_x: null, target_y: null })
          .eq("id", player.id);
      }

      return checkPlayer();
    }
  }

  const { data: ship, error: shipErr } = await supabaseClient
    .from("ships")
    .select("*")
    .eq("player_id", player.id)
    .single();

  if (shipErr) console.error(shipErr);

  setCurrentPlayer(player);
  setCurrentShip(ship);

  renderPlayer(player, ship);
  await loadAndRenderSystemObjects(player, ship);

  // Wire move button (ajustá el id si tu botón es otro)
  const moveBtn = document.getElementById("move-btn");
  if (moveBtn && !moveBtn.dataset.bound) {
    moveBtn.onclick = handleMoveClick;
    moveBtn.dataset.bound = "1";
  }

  // Timers (una sola vez)
  if (!window.__travelTimerStarted) {
    startTravelTimer();
    window.__travelTimerStarted = true;
  }

  if (typeof startBatteryRegen === "function" && !window.__batteryRegenStarted && ship?.id) {
    startBatteryRegen(ship.id);
    window.__batteryRegenStarted = true;
  }
}

export async function initGame() {
  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.onclick = async () => {
      await supabaseClient.auth.signOut();
      window.location.href = "login.html";
    };
    logoutBtn.dataset.bound = "1";
  }

  await checkPlayer();
}

initGame();
