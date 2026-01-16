import { supabaseClient } from "./supabase.js";
import { setCurrentPlayer, setCurrentShip, getCurrentPlayer } from "./state.js";
import { renderPlayer } from "./ui.js";
import { loadAndRenderSystemObjects } from "./world.js";
import { handleMoveClick, startTravelTimer } from "./movement.js";
import { startBatteryRegen } from "./battery.js";

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

  // ✅ si el viaje ya terminó (por F5 / pestaña pausada), finalizar acá
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

async function deleteCharacter() {
  const p = getCurrentPlayer();
  if (!p) {
    alert("No hay jugador cargado.");
    return;
  }

  const ok = confirm("⚠️ Esto eliminará tu personaje y su nave.\n\n¿Seguro que querés continuar?");
  if (!ok) return;

  const ok2 = confirm("Última confirmación: ¿Eliminar definitivamente?");
  if (!ok2) return;

  try {
    // 1) borrar ships
    const { error: shipErr } = await supabaseClient
      .from("ships")
      .delete()
      .eq("player_id", p.id);

    if (shipErr) throw shipErr;

    // 2) borrar player
    const { error: playerErr } = await supabaseClient
      .from("players")
      .delete()
      .eq("id", p.id);

    if (playerErr) throw playerErr;

    setCurrentShip(null);
    setCurrentPlayer(null);

    await supabaseClient.auth.signOut();

    window.location.href = "create-character.html";
  } catch (e) {
    console.error("Error eliminando personaje:", e);
    alert("No se pudo eliminar el personaje (ver consola).");
  }
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

  const marketBtn = document.getElementById("market-btn");
if (marketBtn) {
  marketBtn.addEventListener("click", () => {
    window.location.href = "market.html";
  });
}


  const moveBtn = document.getElementById("move-btn");
  if (moveBtn && !moveBtn.dataset.bound) {
    moveBtn.addEventListener("click", handleMoveClick);
    moveBtn.dataset.bound = "1";
  }


  const delBtn = document.getElementById("delete-character-btn");
  if (delBtn && !delBtn.dataset.bound) {
    delBtn.addEventListener("click", deleteCharacter); // 👈 ESTA línea
    delBtn.dataset.bound = "1";
  }
}



async function init() {
  bindUI();

  if (!window.__travelTimerStarted) {
    startTravelTimer();
    window.__travelTimerStarted = true;
  }

  if (!window.__batteryRegenStarted) {
  startBatteryRegen();
  window.__batteryRegenStarted = true;
}

  await checkPlayer();
}

init();
