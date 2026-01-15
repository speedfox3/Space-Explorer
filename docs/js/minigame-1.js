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

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
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

  // “plano X” (se guarda en players.surface_x opcionalmente; por ahora local)
  surfaceX: 0,

  // scan range (upgradeable)
  scanRange: 25,

  // equipo minería (upgradeable)
  hasMiningGear: false,

  artifacts: [],
  veins: [],
  collecting: null, // { id, lastTs }
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
  // Ajustar nombre de tabla según tu schema real:
  // En tu world.js seguramente usás "space_objects". Mantengo eso.
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
// Mock surface generation (por ahora)
// ----------------------
function generateSurfaceMock() {
  const randX = () => Math.floor(Math.random() * 401) - 200;

  mg.artifacts = Array.from({ length: 10 }, (_, i) => ({
    id: `a_${i}_${mg.planetId}`,
    kind: "artifact",
    name: ["Fósil extraño", "Chatarra alien", "Placa antigua", "Cristal roto", "Cápsula vieja"][i % 5],
    x: randX(),
    cargo_units: 1 + (i % 3),
    market_value: 60 + (i % 5) * 45,
    remaining: 1
  }));

  const mats = [
    { material: "Hierro", cargo_units: 2, market_value: 55 },
    { material: "Cobre", cargo_units: 2, market_value: 70 },
    { material: "Titanio", cargo_units: 3, market_value: 135 },
    { material: "Oro", cargo_units: 3, market_value: 210 },
    { material: "Iridio", cargo_units: 4, market_value: 340 },
  ];

  mg.veins = Array.from({ length: 7 }, (_, i) => {
    const m = mats[i % mats.length];
    const max = 80 + (i % 4) * 60;
    return {
      id: `v_${i}_${mg.planetId}`,
      kind: "vein",
      name: `Veta de ${m.material}`,
      material: m.material,
      x: randX(),
      cargo_units: m.cargo_units,
      market_value: m.market_value,
      max,
      remaining: max
    };
  });
}

// ----------------------
// Visibilidad & velocidad por distancia
// ----------------------
function canSee(item) {
  if (item.remaining <= 0) return false;

  const d = dist(mg.surfaceX, item.x);
  if (d > mg.scanRange) return false;

  if (item.kind === "vein" && !mg.hasMiningGear) return false;

  return true;
}

function harvestRate(d) {
  // unidades por segundo (mock)
  if (d === 0) return 18;     // encima
  if (d <= 5) return 6;       // muy cerca
  if (d <= 12) return 2;      // cerca
  return 0;
}

function setStatus(msg) {
  $("travel-status").textContent = msg;
}

function setCoords() {
  $("player-coords").textContent = `X: ${mg.surfaceX} • Rango: ${mg.scanRange} • ${mg.hasMiningGear ? "Minería" : "Sin minería"}`;
}

function setPlanetUI() {
  $("planet-title").textContent = mg.planet ? `Planeta: ${mg.planet.name || mg.planet.id}` : "";

  const img = $("planet-image");
  const fb = $("planet-image-fallback");

  // columna recomendada: image_url
  const url = mg.planet?.image_url || mg.planet?.img_url || mg.planet?.image || "";
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
// Render cards usando tu contenedor (objects)
// ----------------------
function renderDetected() {
  const container = $("objects-container");
  const visible = [
    ...mg.artifacts.filter(canSee),
    ...mg.veins.filter(canSee),
  ];

  if (visible.length === 0) {
    container.innerHTML = `<div style="color: rgba(255,255,255,0.65); padding: 8px 2px;">
      No detectás nada en rango. Movete en X o aumentá el rango con mejoras.
    </div>`;
    return;
  }

  container.innerHTML = "";

  for (const item of visible) {
    const d = dist(mg.surfaceX, item.x);
    const rate = harvestRate(d);
    const disabled = rate <= 0 || (item.kind === "vein" && !mg.hasMiningGear);

    const extra =
      item.kind === "artifact"
        ? `<div style="color: rgba(255,255,255,0.65); font-size:13px; margin-top:6px;">Se recoge a mano.</div>`
        : `<div style="color: rgba(255,255,255,0.65); font-size:13px; margin-top:6px;">Restante: ${Math.floor(item.remaining)} / ${item.max}</div>`;

    const req =
      item.kind === "vein" && !mg.hasMiningGear
        ? `<div style="color: rgba(255,150,150,0.9); font-size:13px; margin-top:6px;">Requiere equipo de minería</div>`
        : ``;

    const html = `
      <article class="object-card">
        <div class="object-header">
          <h3 style="margin:0">${item.name}</h3>
          <span class="badge">${item.kind === "artifact" ? "Artefacto" : "Veta"}</span>
        </div>

        <div style="margin-top:8px; color: rgba(255,255,255,0.80);">
          X: <b>${item.x}</b> • Distancia: <b>${d}</b>
        </div>

        <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
          <span class="pill">Carga/u: <b>${item.cargo_units}</b></span>
          <span class="pill">Valor: <b>${fmt(item.market_value)}</b></span>
          <span class="pill">Vel: <b>${rate.toFixed(1)}</b> u/s</span>
        </div>

        ${extra}
        ${req}

        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn primary" data-act="harvest" data-id="${item.id}" ${disabled ? "disabled" : ""}>
            ${item.kind === "artifact" ? "Recolectar" : "Minar"}
          </button>
          <button class="btn" data-act="goto" data-x="${item.x}">Ir a X</button>
        </div>
      </article>
    `;

    const div = document.createElement("div");
    div.innerHTML = html;
    const card = div.firstElementChild;

    card.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.getAttribute("data-act");
        if (act === "goto") {
          moveToX(Number(btn.getAttribute("data-x")));
          renderDetected();
          return;
        }
        if (act === "harvest") {
          startHarvest(btn.getAttribute("data-id"));
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

function findItem(id) {
  return mg.artifacts.find(a => a.id === id) || mg.veins.find(v => v.id === id) || null;
}

function stopHarvest(msg) {
  mg.collecting = null;
  if (msg) setStatus(msg);
}

async function addCargo(cargoDelta) {
  const ship = getCurrentShip();
  if (!ship) return;

  const newCargo = Number(ship.cargo || 0) + cargoDelta;
  const cargoMax = Number(ship.cargo_max || ship.cargoMax || 0);

  if (cargoMax && newCargo > cargoMax) {
    throw new Error("CARGO_FULL");
  }

  // Persistimos cargo real en BD
  const { error } = await supabaseClient
    .from("ships")
    .update({ cargo: newCargo })
    .eq("id", ship.id);

  if (error) throw error;

  // refrescar state + ui
  ship.cargo = newCargo;
  renderPlayer(getCurrentPlayer(), ship);
}

async function startHarvest(id) {
  const item = findItem(id);
  if (!item || item.remaining <= 0) return;

  const d = dist(mg.surfaceX, item.x);
  const rate = harvestRate(d);

  if (rate <= 0) {
    setStatus("Estás demasiado lejos para recolectar. Acercate en X.");
    return;
  }

  if (item.kind === "artifact") {
    // instantáneo
    try {
      await addCargo(item.cargo_units);
      item.remaining = 0;
      setStatus(`Recolectaste ${item.name} (+${item.cargo_units} carga).`);
      renderDetected();
    } catch (e) {
      if (e?.message === "CARGO_FULL") setStatus("No tenés espacio de carga.");
      else {
        console.error(e);
        setStatus("Error guardando carga (ver consola).");
      }
    }
    return;
  }

  // Veta
  if (!mg.hasMiningGear) {
    setStatus("Necesitás equipo de minería para minar vetas.");
    return;
  }

  mg.collecting = { id: item.id, lastTs: performance.now() };
  setStatus(`Minando ${item.name}...`);
}

async function tick(ts) {
  if (mg.collecting) {
    const item = findItem(mg.collecting.id);

    if (!item || item.remaining <= 0) {
      stopHarvest("La veta se agotó. Buscá otra.");
      renderDetected();
    } else {
      const dt = (ts - mg.collecting.lastTs) / 1000;
      mg.collecting.lastTs = ts;

      const d = dist(mg.surfaceX, item.x);
      const rate = harvestRate(d);

      if (rate <= 0) {
        stopHarvest("Te alejaste demasiado. Se detuvo la minería.");
        renderDetected();
      } else {
        const mined = Math.min(item.remaining, rate * dt);
        const cargoDelta = mined * item.cargo_units;

        try {
          await addCargo(cargoDelta);
          item.remaining = Math.max(0, item.remaining - mined);

          if (item.remaining <= 0) {
            stopHarvest("¡Veta agotada! Escaneá para encontrar otra.");
            renderDetected();
          }
        } catch (e) {
          if (e?.message === "CARGO_FULL") {
            stopHarvest("Carga llena. Minería detenida.");
          } else {
            console.error(e);
            stopHarvest("Error guardando carga (ver consola).");
          }
          renderDetected();
        }
      }
    }
  }

  requestAnimationFrame(tick);
}

// ----------------------
// UI bindings
// ----------------------
async function deleteCharacterLikeMain() {
  // Reuso el mismo flujo que main.js (simplificado)
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
    moveBtn.addEventListener("click", () => {
      moveToX(Number($("move-x").value));
      renderDetected();
    });
    moveBtn.dataset.bound = "1";
  }

  const scanBtn = $("scan-btn");
  if (scanBtn && !scanBtn.dataset.bound) {
    scanBtn.addEventListener("click", () => {
      if (mg.collecting) stopHarvest("Escaneo realizado. Minería pausada.");
      renderDetected();
      setStatus("Escaneo completado.");
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
  // mg.scanRange = player.scan_range || 25
  // mg.hasMiningGear = player.has_mining_gear || false

  generateSurfaceMock();
  renderDetected();
  setStatus("Aterrizaste. Escaneá y recolectá.");

  requestAnimationFrame(tick);
}

init();
