// interactions.js
import { supabaseClient } from "./supabase.js";
import { getCurrentPlayer, getCurrentShip, setCurrentPlayer } from "./state.js";
import { canInteract } from "./balance.js";

// Por ahora conserva tu lógica simple. Más adelante esto llama RPC/minijuego.
export async function interactWithObject(obj) {
  const player = getCurrentPlayer();
  const ship = getCurrentShip();
  if (!player || !ship) return;

  if (!canInteract(player, obj)) {
    alert("Fuera de alcance");
    return;
  }

  // Ejemplo: consumir recursos (si tu RLS lo permite; ideal: RPC)
  if (obj.resources_remaining != null && obj.resources_remaining <= 0) {
    alert("Este objeto ya no tiene recursos.");
    return;
  }

  if (obj.type === "planet") {
  window.location.href = `mini-game1.html?planet_id=${encodeURIComponent(obj.id)}`;
  return;
}

  const newRemaining = Math.max(0, (obj.resources_remaining ?? 0) - 10);

  const { error } = await supabaseClient
    .from("space_objects")
    .update({ resources_remaining: newRemaining })
    .eq("id", obj.id);

  if (error) {
    console.error(error);
    alert("Error interactuando con el objeto (ver consola).");
    return;
  }

  alert("Interacción completada (placeholder).");
}
