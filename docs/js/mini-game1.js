import { supabaseClient } from "./supabase.js";
import { setCurrentPlayer, setCurrentShip, getCurrentPlayer, getCurrentShip } from "./state.js";
import { renderPlayer } from "./ui.js";

// ----------------------
// Helpers
// ----------------------
const $ = (id) => document.getElementById(id);

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function dist(a, b) {
  return Math.abs(a - b);
}

function fmt(n) {
  return new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 }).format(n);
}

// ----------------------
// MiniGame state
// ----------------------
const mg = {
  planetId: null,
  planet: null,

  // plano X
  surfaceX: 0,

  // upgrades (luego desde BD)
  scanRange: 25,
  hasMiningGear: false,

  // Nodos reales de BD (object_nodes join items)
  nodes: [],

  // mining loop
  collecting: null, // { nodeId, lastTs, cooldownUntil }
};

// ----------------------
// Supabase loads (player/ship igual que main)
// ----------------------
async function checkPlayerAndShip() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return false;
  }

  const { data: player, error: playerErr } = await supabaseClient
    .from("players")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (playerErr) console.error("mini-game checkPlayer playerErr:", playerErr);

  if (!player) {
    window.location.href = "create-character.html";
    return false;
  }

  const { data: ship, error: shipErr } = await supabaseClient
    .from("ships")
    .select("*")
    .eq("player_id", player.id)
    .single();

  if (shipErr) console.error("mini-game checkPlayer shipErr:", shipErr);

  setCurrentPlayer(player);
  setCurrentShip(ship);

  renderPlayer(player, ship);
  return true;
}

async function loadPlanet() {
  const { data, error } = await supabaseClient
    .from("space_objects")
    .select("*")
    .eq("id", mg.planetId)
    .single();

  if (error) {
    console.error("loadPlanet error:", error);
    return null;
  }
  return data;
}

// ----------------------
// RPC: recolectar/minar atómico (object_nodes -> ship_inventory -> ships.cargo_used)
// ----------------------
async function collectFromNode(nodeId, qtyWanted) {
  const ship = getCurrentShip();
  const player = getCurrentPlayer();
  if (!ship) throw new Error("NO_SHIP");

  const { data, error } = await supabaseClient.rpc("collect_node", {
    p_ship_id: ship.id,
    p_node_id: nodeId,
    p_qty: qtyWanted
  });

  if (error) throw error;

  const res = data?.[0];
  if (!res?.ok) {
    const msg = res?.message || "error";
    const e = new Error(msg);
    e.code = msg;
    throw e;
  }

  // Sync UI con cargo recalculado por la RPC
  ship.cargo_used = res.ship_cargo_used;
  ship.cargo_capacity = res.ship_cargo_capacity;
  renderPlayer(player, ship);

  return res; // { collected_qty, node_remaining, ... }
}

// ----------------------
// Escaneo real desde BD
// - Trae nodos del objeto
// - Filtra por rango en JS (más simple que abs() en query builder)
// ----------------------
async function scanAndLoadNodes() {
  const { data, error } = await supabaseClient
    .from("object_nodes")
    .select(`
      id, node_type, x, remaining, max, item_id,
      items ( name, kind, cargo_units, base_value )
    `)
    .eq("object_id", mg.planetId)
    .gt("remaining", 0);

  if (error) throw error;

  const all = data || [];

  // Filtrar por rango
  mg.nodes = all.filter(n => Math.abs(n.x - mg.surfaceX) <= mg.scanRange);

  // Regla: si no hay equipo minería, ocultar vetas
  if (!mg.hasMiningGear) {
    mg.nodes = mg.nodes.filter(n => n.node_type !== "vein");
  }

  // Ordenar por cercanía
  mg.nodes.sort((a, b) => Math.abs(a.x - mg.surfaceX) - Math.abs(b.x - mg.surfaceX));
}

// ----------------------
// Velocidad por distancia (unidades por segundo)
// ----------------------
function harvestRate(d) {
  if (d === 0) return 18;
  if (d <= 5) return 6;
  if (d <= 12) return 2;
  return 0;
}

function setStatus(msg) {
  $("travel-status").textContent = msg;
}

function setCoords() {
  $("player-coords").textContent =
    `X: ${mg.surfaceX} • Rango: ${mg.scanRange} • ${mg.hasMiningGear ? "Minería" : "Sin minería"}`;
}

function setPlanetUI() {
  $("planet-title").textContent = mg.planet ? `Planeta: ${mg.planet.name || mg.planet.id}` : "";

  const img = $("planet-image");
  const fb = $("planet-image-fallback");

  // Tu BD tiene image_path (GitHub Pages)
  const url = mg.planet?.image_path || "";
  if (url) {
    img.src = url;
    img.style.display = "block";
    fb.style.display = "none";
  } else {
    img.style.display = "none";
    fb.style.display = "block";
  }
}

// ----------------------
// Render cards (nodos reales)
// ----------------------
function renderDetected() {
  const container = $("objects-container");
  const visible = mg.nodes || [];

  if (visible.length === 0) {
    container.innerHTML = `<div style="color: rgba(255,255,255,0.65); padding: 8px 2px;">
      No detectás nada en rango. Movete en X o aumentá el rango con mejoras.
    </div>`;
    return;
  }

  container.innerHTML = "";

  for (const node of visible) {
    const d = dist(mg.surfaceX, node.x);
    const rate = harvestRate(d);
    const isVein = node.node_type === "vein";
    const disabled = rate <= 0 || (isVein && !mg.hasMiningGear);

    const name = node.items?.name ?? "Item";
    const kind = node.items?.kind ?? "unknown";
    const cargoUnits = node.items?.cargo_units ?? 1;
    const value = node.items?.base_value ?? 0;

    const badge =
      node.node_type === "hand" ? "Artefacto"
      : node.node_type === "vein" ? "Veta"
      : "Nodo";

    const extra =
      node.node_type === "hand"
        ? `<div style="color: rgba(255,255,255,0.65); font-size:13px; margin-top:6px;">Se recoge a mano.</div>`
        : `<div style="color: rgba(255,255,255,0.65); font-size:13px; margin-top:6px;">Restante: ${Math.floor(node.remaining)} / ${node.max}</div>`;

    const req =
      isVein && !mg.hasMiningGear
        ? `<div style="color: rgba(255,150,150,0.9); font-size:13px; margin-top:6px;">Requiere equipo de minería</div>`
        : ``;

    const html = `
      <article class="object-card">
        <div class="object-header">
          <h3 style="margin:0">${name}</h3>
          <span class="badge">${badge}</span>
        </div>

        <div style="margin-top:8px; color: rgba(255,255,255,0.80);">
          Tipo: <b>${kind}</b> • X: <b>${node.x}</b> • Distancia: <b>${d}</b>
        </div>

        <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
          <span class="pill">Carga/u: <b>${cargoUnits}</b></span>
          <span class="pill">Valor: <b>${fmt(value)}</b></span>
          <span class="pill">Vel: <b>${rate.toFixed(1)}</b> u/s</span>
        </div>

        ${extra}
        ${req}

        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn primary" data-act="harvest" data-id="${node.id}" ${disabled ? "disabled" : ""}>
            ${node.node_type === "hand" ? "Recolectar" : "Minar"}
          </button>
          <button class="btn" data-act="goto" data-x="${node.x}">Ir a X</button>
        </div>
      </article>
    `;

    const div = document.createElement("div");
    div.innerHTML = html;
    const card = div.firstElementChild;

    card.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const act = btn.getAttribute("data-act");
        if (act === "goto") {
          moveToX(Number(btn.getAttribute("data-x")));
          await doScan(false);
          return;
        }
        if (act === "harvest") {
          await startHarvest(btn.getAttribute("data-id"));
        }
      });
    });

    container.appendChild(card);
  }
}

// ----------------------
// Movimiento y recolección
// ----------------------
function moveToX(x) {
  if (!Number.isFinite(x)) return;
  mg.surfaceX = Math.floor(x);
  $("move-x").value = String(mg.surfaceX);
  setCoords();
  setStatus(`Te moviste a X=${mg.surfaceX}.`);
}

function findNode(nodeId) {
  return (mg.nodes || []).find(n => n.id === nodeId) || null;
}

function stopHarvest(msg) {
  mg.collecting = null;
  if (msg) setStatus(msg);
}

async function startHarvest(nodeId) {
  const node = findNode(nodeId);
  if (!node || node.remaining <= 0) return;

  const d = dist(mg.surfaceX, node.x);
  const rate = harvestRate(d);

  if (rate <= 0) {
    setStatus("Estás demasiado lejos para recolectar. Acercate en X.");
    return;
  }

  // Hand: instantáneo (1 unidad)
  if (node.node_type === "hand") {
    try {
      const res = await collectFromNode(nodeId, 1);
      node.remaining = res.node_remaining;

      setStatus(`Recolectado x${res.collected_qty}`);
      await doScan(false);
    } catch (e) {
      if (e.code === "cargo_full") setStatus("Carga llena.");
      else if (e.code === "node_empty") setStatus("Ese recurso ya se agotó.");
      else {
        console.error(e);
        setStatus("Error recolectando (ver consola).");
      }
    }
    return;
  }

  // Vein: loop continuo
  if (node.node_type === "vein" && !mg.hasMiningGear) {
    setStatus("Necesitás equipo de minería para minar vetas.");
    return;
  }

  mg.collecting = {
    nodeId,
    lastTs: performance.now(),
    cooldownUntil: 0
  };

  setStatus("Recolectando...");
}

async function tick(ts) {
  if (mg.collecting) {
    const node = findNode(mg.collecting.nodeId);

    if (!node || node.remaining <= 0) {
      stopHarvest("El recurso se agotó.");
      await doScan(false);
      requestAnimationFrame(tick);
      return;
    }

    const d = dist(mg.surfaceX, node.x);
    const rate = harvestRate(d);

    if (rate <= 0) {
      stopHarvest("Te alejaste demasiado. Se detuvo la recolección.");
      requestAnimationFrame(tick);
      return;
    }

    // Throttle para no llamar RPC en cada frame (1 llamada cada 700ms)
    if (ts < (mg.collecting.cooldownUntil || 0)) {
      requestAnimationFrame(tick);
      return;
    }
    mg.collecting.cooldownUntil = ts + 700;

    const dt = (ts - mg.collecting.lastTs) / 1000;
    mg.collecting.lastTs = ts;

    // qtyWanted: basado en rate y dt (mínimo 1)
    const qtyWanted = Math.max(1, Math.floor(rate * Math.max(0.7, dt)));

    try {
      const res = await collectFromNode(node.id, qtyWanted);
      node.remaining = res.node_remaining;

      if (node.remaining <= 0) {
        stopHarvest("¡Nodo agotado! Escaneá para encontrar otro.");
        await doScan(false);
      }
    } catch (e) {
      if (e.code === "cargo_full") stopHarvest("Carga llena. Recolección detenida.");
      else if (e.code === "node_empty") stopHarvest("Ese recurso ya se agotó.");
      else {
        console.error(e);
        stopHarvest("Error recolectando (ver consola).");
      }
      await doScan(false);
    }
  }

  requestAnimationFrame(tick);
}

async function doScan(showStatus = true) {
  try {
    await scanAndLoadNodes();
    renderDetected();
    if (showStatus) setStatus("Escaneo completado.");
  } catch (e) {
    console.error(e);
    if (showStatus) setStatus("Error escaneando (ver consola).");
  }
}

// ----------------------
// UI bindings
// ----------------------
async function deleteCharacterLikeMain() {
  const p = getCurrentPlayer();
  if (!p) return alert("No hay jugador cargado.");

  const ok = confirm("⚠️ Esto eliminará tu personaje y su nave.\n\n¿Seguro que querés continuar?");
  if (!ok) return;
  const ok2 = confirm("Última confirmación: ¿Eliminar definitivamente?");
  if (!ok2) return;

  try {
    const { error: shipErr } = await supabaseClient.from("ships").delete().eq("player_id", p.id);
    if (shipErr) throw shipErr;

    const { error: playerErr } = await supabaseClient.from("players").delete().eq("id", p.id);
    if (playerErr) throw playerErr;

    await supabaseClient.auth.signOut();
    window.location.href = "create-character.html";
  } catch (e) {
    console.error(e);
    alert("No se pudo eliminar el personaje (ver consola).");
  }
}

function bindUI() {
  const logoutBtn = $("logout-btn");
  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      window.location.href = "login.html";
    });
    logoutBtn.dataset.bound = "1";
  }

  const moveBtn = $("move-btn");
  if (moveBtn && !moveBtn.dataset.bound) {
    moveBtn.addEventListener("click", async () => {
      moveToX(Number($("move-x").value));
      await doScan(false);
    });
    moveBtn.dataset.bound = "1";
  }

  const scanBtn = $("scan-btn");
  if (scanBtn && !scanBtn.dataset.bound) {
    scanBtn.addEventListener("click", async () => {
      if (mg.collecting) stopHarvest("Escaneo realizado. Recolección pausada.");
      await doScan(true);
    });
    scanBtn.dataset.bound = "1";
  }

  const backBtn = $("back-btn");
  if (backBtn && !backBtn.dataset.bound) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    backBtn.dataset.bound = "1";
  }

  const delBtn = $("delete-character-btn");
  if (delBtn && !delBtn.dataset.bound) {
    delBtn.addEventListener("click", deleteCharacterLikeMain);
    delBtn.dataset.bound = "1";
  }
}

// ----------------------
// Init
// ----------------------
async function init() {
  bindUI();

  const ok = await checkPlayerAndShip();
  if (!ok) return;

  mg.planetId = getQueryParam("planet_id");
  if (!mg.planetId) {
    alert("Falta planet_id en la URL.");
    window.location.href = "index.html";
    return;
  }

  // aterrizaje (X aleatorio)
  mg.surfaceX = Math.floor(Math.random() * 61) - 30;
  $("move-x").value = String(mg.surfaceX);
  setCoords();

  mg.planet = await loadPlanet();
  if (!mg.planet) {
    setStatus("No se pudo cargar el planeta (ver consola).");
    return;
  }

  setPlanetUI();

  // TODO: upgrades reales desde BD:
  // mg.scanRange = ship.radar_range || 25
  // mg.hasMiningGear = player.has_mining_gear || false

  await doScan(false);
  setStatus("Aterrizaste. Escaneá y recolectá.");

  requestAnimationFrame(tick);
}

init();
