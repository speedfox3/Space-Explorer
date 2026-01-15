import { supabaseClient } from "./supabase.js";
import { setCurrentPlayer, setCurrentShip } from "./state.js";
import { renderPlayer } from "./ui.js";
import { loadAndRenderSystemObjects } from "./world.js";
import { handleMoveClick, startTravelTimer } from "./movement.js";

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

  if (playerErr) console.error("checkPlayer playerErr:", playerErr);

  if (!player) {
    window.location.href = "create-character.html";
    return;
  }

  // ✅ Robustez: si el viaje ya terminó (por F5 / pestaña pausada), finalizar acá
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

  if (shipErr) console.error("checkPlayer shipErr:", shipErr);

  setCurrentPlayer(player);
  setCurrentShip(ship);

  renderPlayer(player, ship);
  await loadAndRenderSystemObjects(player, ship);
}

function bindUI() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      window.location.href = "login.html";
    });
    logoutBtn.dataset.bound = "1";
  }

  const moveBtn = document.getElementById("move-btn");
  if (moveBtn && !moveBtn.dataset.bound) {
    moveBtn.addEventListener("click", handleMoveClick);
    moveBtn.dataset.bound = "1";
  }
}

async function init() {
  bindUI();

  if (!window.__travelTimerStarted) {
    startTravelTimer();
    window.__travelTimerStarted = true;
  }

  await checkPlayer();
}

init();
