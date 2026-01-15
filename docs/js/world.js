// world.js
import { supabaseClient } from "./supabase.js";
import { setCurrentSystemObjects } from "./state.js";
import { distance } from "./math.js";
import { canSee, canInteract, getEffectiveRadarRange } from "./balance.js";
import { interactWithObject } from "./interactions.js";

export async function loadAndRenderSystemObjects(player, ship) {
  const container = document.getElementById("objects-container");
  if (!container) return;

  container.innerHTML = "";

  const { data: objects, error } = await supabaseClient
    .from("space_objects")
    .select("*")
    .eq("system_id", player.system);

  if (error) {
    console.error("Error trayendo space_objects:", error);
    container.innerHTML = "<p>Error cargando objetos del sistema</p>";
    return;
  }

  const normalized = (objects ?? []).map(o => ({
    ...o,
    x: Number(o.x),
    y: Number(o.y),
    system_id: Number(o.system_id),
  }));

  // Cache global (colisiones)
  setCurrentSystemObjects(normalized);

  if (!objects || objects.length === 0) {
    container.innerHTML = "<p>No hay objetos en este sistema</p>";
    return;
  }

  const radarRange = getEffectiveRadarRange(player, ship);
  const visibleNow = normalized.filter(o => canSee(player, ship, o));

  // Upsert descubrimientos (si ya creaste player_discovered_objects)
  if (visibleNow.length > 0) {
    const rows = visibleNow.map(o => ({
      player_id: player.id,
      object_id: o.id,
      last_seen_at: new Date().toISOString()
    }));

    const { error: upsertErr } = await supabaseClient
      .from("player_discovered_objects")
      .upsert(rows, { onConflict: "player_id,object_id" });

    if (upsertErr) console.error("Error upsert descubrimientos:", upsertErr);
  }

  // Traer descubiertos (Plan B si el join no funciona: hacemos IN por ids)
  let discoveredObjects = [];
  const { data: discovered, error: discErr } = await supabaseClient
    .from("player_discovered_objects")
    .select("object_id")
    .eq("player_id", player.id);

  if (!discErr && discovered?.length) {
    const ids = discovered.map(r => r.object_id);
    const { data: discObjs, error: discObjsErr } = await supabaseClient
      .from("space_objects")
      .select("*")
      .in("id", ids)
      .eq("system_id", player.system);

    if (!discObjsErr) {
      discoveredObjects = (discObjs ?? []).map(o => ({ ...o, x: Number(o.x), y: Number(o.y), system_id: Number(o.system_id) }));
    }
  }

  const visibleIds = new Set(visibleNow.map(o => o.id));
  const discoveredButNotVisible = discoveredObjects.filter(o => !visibleIds.has(o.id));

  const parts = [];
  parts.push(`<h3>Detectados por radar (rango: ${radarRange})</h3>`);
  if (visibleNow.length === 0) parts.push(`<p>No detectás nada ahora mismo.</p>`);
  else visibleNow.forEach(obj => parts.push(renderObjectCard(player, ship, obj, true)));

  parts.push(`<h3>Descubiertos</h3>`);
  if (discoveredButNotVisible.length === 0) parts.push(`<p>Aún no tenés objetos descubiertos fuera del radar.</p>`);
  else discoveredButNotVisible.forEach(obj => parts.push(renderObjectCard(player, ship, obj, false)));

  container.innerHTML = parts.join("\n");

  // wire buttons
  container.querySelectorAll("button[data-obj-id]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-obj-id");
      const obj =
        normalized.find(o => o.id === id) ||
        discoveredObjects.find(o => o.id === id);

      if (obj) interactWithObject(obj);
    };
  });
}

function renderObjectCard(player, ship, obj, isVisibleNow) {
  const dist = distance(player, obj);
  const interactable = canInteract(player, obj);

  const playerLevel = player.level ?? 1;
  const objLevel = obj.level ?? 1;
  const levelOk = playerLevel >= objLevel;

  const status = isVisibleNow ? "🟢 Radar" : "🟡 Descubierto";
  const disabledReason =
    !levelOk ? "Nivel insuficiente" :
    !interactable ? "Fuera de alcance" :
    "";

  return `
    <div class="object">
      <h3>${obj.type} <small>${status}</small></h3>
      <small>Nivel: ${objLevel}</small><br/>
      <small>Recursos: ${obj.resources_remaining ?? "-"}</small>
      <div>📍 Posición: X:${obj.x} | Y:${obj.y}</div>
      <div>📏 Distancia: ${Math.round(dist)}</div>
      <button data-obj-id="${obj.id}" ${disabledReason ? "disabled" : ""}>
        ${disabledReason ? disabledReason : "Interactuar"}
      </button>
    </div>
  `;
}
