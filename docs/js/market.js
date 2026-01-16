import { supabaseClient } from "./supabase.js";

let session = null;
let player = null;
let currentShipId = null;

let inventory = [];
let marketFeePct = 0.05;
let directSellPct = 0.8;


function $(id) { return document.getElementById(id); }
function fmt(n) { return Number(n || 0).toLocaleString("es-ES"); }

async function requireSession() {
  const { data } = await supabaseClient.auth.getSession();
  session = data.session;
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

async function loadConfig() {
  const { data, error } = await supabaseClient
    .from("market_config")
    .select("listing_fee_pct,direct_sell_pct")
    .eq("id", 1)
    .maybeSingle();

  if (!error && data) {
    marketFeePct = Number(data.listing_fee_pct ?? marketFeePct);
    directSellPct = Number(data.direct_sell_pct ?? directSellPct);
  }

  const feePctEl = $("fee-pct");
  if (feePctEl) feePctEl.textContent = `${Math.round(marketFeePct * 100)}%`;
}

async function loadPlayer() {
  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) throw error;
  player = data;

  $("player-name") && ($("player-name").textContent = player.name ?? "Comandante");
  $("player-credits") && ($("player-credits").textContent = fmt(player.credits));
  $("player-location") && ($("player-location").textContent = `X:${player.x ?? 0} Y:${player.y ?? 0}`);
}

async function loadInventory() {
  // 1) buscar ship_id del jugador (tomamos la primera nave)
  const { data: ships, error: shipErr } = await supabaseClient
    .from("ships")
    .select("id")
    .eq("player_id", session.user.id)
    .limit(1);
  const shipId = ships?.[0]?.id;     // <- primero se declara
  
  if (shipErr) throw shipErr;

  currentShipId = shipId || null;    // <- ahora sí

  if (!shipId) {
    inventory = [];
    renderSellInventory();
    renderBuyTypes();
    updateSellFormHints();
    return;
  }

  // 2) cargar la bahía real (ship_inventory)
  const { data, error } = await supabaseClient
    .from("ship_inventory")
    .select("item_id, qty, items:items(id,name,rarity,type,base_value,stackable)")
    .eq("ship_id", shipId)
    .gt("qty", 0)
    .order("qty", { ascending: false });

  if (error) throw error;

  inventory = data || [];
  renderSellInventory();
  renderBuyTypes();
  updateSellFormHints();
}



function setTab(tab) {
  const buyView = $("buy-view");
  const sellView = $("sell-view");

  const tabBuy = $("tab-buy");
  const tabSell = $("tab-sell");

  if (tab === "buy") {
    buyView && (buyView.style.display = "");
    sellView && (sellView.style.display = "none");
    tabBuy && tabBuy.classList.add("primary");
    tabSell && tabSell.classList.remove("primary");
    fetchMarketListings();
  } else {
    sellView && (sellView.style.display = "");
    buyView && (buyView.style.display = "none");
    tabSell && tabSell.classList.add("primary");
    tabBuy && tabBuy.classList.remove("primary");
    loadMyListings();
  }
}

function renderSellInventory() {
  const sel = $("sell-item");
  if (!sel) return;

  sel.innerHTML = `<option value="">— Seleccioná un item de la bahía —</option>`;
  for (const row of inventory) {
    const it = row.items;
    if (!it) continue;

    const opt = document.createElement("option");
    opt.value = row.item_id;
    opt.textContent = `${it.name} (x${row.qty})`;
    opt.dataset.maxQty = String(row.qty);
    opt.dataset.basePrice = String(it.base_value ?? 0);
    opt.dataset.stackable = it.stackable ? "1" : "0";
    sel.appendChild(opt);
  }
}

function renderBuyTypes() {
  const sel = $("buy-type");
  if (!sel) return;

  const types = ["Minerales", "Componentes", "Armas", "Consumibles"];
  sel.innerHTML = `<option value="">(Todos) — primeros 50 (alfabético)</option>`;
  for (const t of types) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  }
}

function updateSellFormHints() {
  const mode = $("sell-mode")?.value || "listing";
  const priceEl = $("sell-price");
  const feeEl = $("sell-fee");

  const opt = $("sell-item")?.selectedOptions?.[0];
  const basePrice = Number(opt?.dataset?.basePrice || 0);

  if (mode === "direct") {
    if (priceEl) {
      priceEl.disabled = true;
      priceEl.value = "";
      priceEl.placeholder = "No aplica (venta directa)";
    }
    const unit = Math.max(1, Math.floor(basePrice * directSellPct));
    feeEl && (feeEl.textContent =
      `Venta directa: ${fmt(unit)} cr/unidad (base_value * ${directSellPct}). No hay fee.`
    );
  } else {
    if (priceEl) {
      priceEl.disabled = false;
      priceEl.placeholder = "Precio por unidad";
      if (!priceEl.value && basePrice > 0) priceEl.value = String(Math.max(1, basePrice));
    }
    const pct = Math.round(marketFeePct * 100);
    feeEl && (feeEl.textContent =
      `Fee de publicación: ${pct}% del total (qty * precio). Se cobra al publicar.`
    );
  }
}

async function fetchMarketListings() {
  const type = $("buy-type")?.value || "";
  const q = ($("item")?.value || "").trim();

  let query = supabaseClient
    .from("market_listings")
    .select("id, seller_id, qty, price_per_unit, status, created_at, items:items(id,name,rarity,type,stackable)")
    .eq("status", "active");

  if (type) query = query.eq("items.type", type);
  if (q) query = query.ilike("items.name", `%${q}%`);

  // regla: si no hay nada => primeros 50 alfabético
  query = query.order("items(name)", { ascending: true }).limit(50);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    $("srch-status") && ($("srch-status").textContent = "Error cargando mercado (ver consola).");
    return;
  }

  $("srch-status") && ($("srch-status").textContent = q ? `Resultados: ${data?.length ?? 0}` : "Mostrando listado default.");
  renderMarket(data || []);
}

function renderMarket(rows) {
  const wrap = $("market-list");
  if (!wrap) return;

  wrap.innerHTML = "";
  if (rows.length === 0) {
    wrap.innerHTML = `<div style="opacity:.7;">No hay publicaciones para ese filtro.</div>`;
    return;
  }

  for (const l of rows) {
    const it = l.items || {};
    const mine = l.seller_id === session.user.id;

    const card = document.createElement("div");
    card.className = "panel";
    card.style.marginBottom = "10px";

    card.innerHTML = `
      <div class="panel-inner">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <div>
            <div style="font-weight:900;">${it.name ?? "Item"}</div>
            <div style="opacity:.75; font-size:13px;">
              Tipo: ${it.type ?? "-"} · Rarity: ${it.rarity ?? "common"} · Stock: ${fmt(l.qty)}
              ${mine ? " · (Tu publicación)" : ""}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:900;">${fmt(l.price_per_unit)} cr</div>
            <div style="opacity:.75; font-size:13px;">por unidad</div>
          </div>
        </div>

        ${mine ? "" : `
          <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; align-items:center;">
            <input type="number" min="1" max="${l.qty}" value="1" style="width:110px;" data-buy-qty="${l.id}">
            <button class="btn primary" data-buy="${l.id}">Comprar</button>
          </div>
        `}
      </div>
    `;
    wrap.appendChild(card);
  }

  wrap.querySelectorAll("[data-buy]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.addEventListener("click", () => onBuy(btn.dataset.buy));
    btn.dataset.bound = "1";
  });
}

async function loadMyListings() {
  const wrap = $("my-listings");
  if (!wrap) return;

  const { data, error } = await supabaseClient
    .from("market_listings")
    .select("id, qty, price_per_unit, status, created_at, items:items(id,name,type,rarity)")
    .eq("seller_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    wrap.innerHTML = `<div style="opacity:.7;">Error cargando tus publicaciones.</div>`;
    return;
  }

  wrap.innerHTML = "";
  if (!data || data.length === 0) {
    wrap.innerHTML = `<div style="opacity:.7;">No tenés publicaciones.</div>`;
    return;
  }

  for (const l of data) {
    const it = l.items || {};
    const card = document.createElement("div");
    card.className = "panel";
    card.style.marginBottom = "10px";

    card.innerHTML = `
      <div class="panel-inner">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <div>
            <div style="font-weight:900;">${it.name ?? "Item"}</div>
            <div style="opacity:.75; font-size:13px;">
              ${it.type ?? "-"} · ${it.rarity ?? "-"} · Estado: ${l.status} · Qty: ${fmt(l.qty)}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:900;">${fmt(l.price_per_unit)} cr</div>
            <div style="opacity:.75; font-size:13px;">por unidad</div>
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
          ${l.status === "active" ? `<button class="btn danger" data-cancel="${l.id}">Cancelar</button>` : ""}
        </div>
      </div>
    `;
    wrap.appendChild(card);
  }

  wrap.querySelectorAll("[data-cancel]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.addEventListener("click", () => onCancel(btn.dataset.cancel));
    btn.dataset.bound = "1";
  });
}

async function onCancel(listingId) {
  const ok = confirm("¿Cancelar la publicación? (devuelve los items a tu inventario)");
  if (!ok) return;

  try {
    const { error } = await supabaseClient.rpc("cancel_listing", { p_listing_id: listingId });
    if (error) throw error;

    await loadInventory();
    await loadMyListings();
    alert("✅ Publicación cancelada.");
  } catch (e) {
    console.error("cancel error:", e);
    alert(`No se pudo cancelar: ${e.message || e}`);
  }
}

async function onBuy(listingId) {
  try {
    const qty = Number(document.querySelector(`[data-buy-qty="${listingId}"]`)?.value || 1);
    if (!Number.isFinite(qty) || qty <= 0) return alert("Cantidad inválida.");

    const { data, error } = await supabaseClient.rpc("buy_listing", {
      p_listing_id: listingId,
      p_qty: qty
    });
    if (error) throw error;

    await loadPlayer();
    await loadInventory();
    await fetchMarketListings();

    alert(`✅ Compra realizada. Total: ${fmt(data?.total_price)} cr`);
  } catch (e) {
    console.error("buy error:", e);
    alert(`No se pudo comprar: ${e.message || e}`);
  }
}

async function onSell() {
  const itemId = $("sell-item")?.value;
  const mode = $("sell-mode")?.value || "listing";
  const qty = Number($("sell-qty")?.value || 0);

  if (!itemId) return alert("Elegí un item.");
  if (!Number.isFinite(qty) || qty <= 0) return alert("Cantidad inválida.");

  try {
    if (mode === "direct") {
      const { data, error } = await supabaseClient.rpc("sell_to_market_ship", {
  p_ship_id: currentShipId,
  p_item_id: itemId,
  p_qty: qty
});
      if (error) throw error;

      await loadPlayer();
      await loadInventory();
      alert(`✅ Venta directa: +${fmt(data.total)} cr (a ${fmt(data.unit_price)}/u)`);
      return;
    }

    const price = Number($("sell-price")?.value || 0);
    if (!Number.isFinite(price) || price <= 0) return alert("Precio inválido.");

    const { error } = await supabaseClient.rpc("create_listing", {
      p_item_id: itemId,
      p_qty: qty,
      p_price_per_unit: price
    });
    if (error) throw error;

    await loadPlayer();        // fee deducted
    await loadInventory();     // inventory decremented
    await fetchMarketListings();
    await loadMyListings();

    alert("✅ Publicación creada (fee cobrado).");
  } catch (e) {
    console.error("sell error:", e);
    alert(`No se pudo vender/publicar: ${e.message || e}`);
  }
}

function bindUI() {
  $("back-btn")?.addEventListener("click", () => (window.location.href = "index.html"));
  $("logout-btn")?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  });

  $("tab-buy")?.addEventListener("click", () => setTab("buy"));
  $("tab-sell")?.addEventListener("click", () => setTab("sell"));

  $("buy-type")?.addEventListener("change", fetchMarketListings);

  $("srch-btn")?.addEventListener("click", fetchMarketListings);
  $("item")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") fetchMarketListings();
  });

  $("sell-item")?.addEventListener("change", (ev) => {
    const opt = ev.target.selectedOptions?.[0];
    const maxQty = Number(opt?.dataset?.maxQty || 1);
    const stackable = opt?.dataset?.stackable === "1";

    const qtyEl = $("sell-qty");
    if (qtyEl) {
      qtyEl.max = stackable ? String(maxQty) : "1";
      qtyEl.value = "1";
      qtyEl.disabled = !stackable;
    }
    updateSellFormHints();
  });

  $("sell-mode")?.addEventListener("change", updateSellFormHints);
  $("sell-btn")?.addEventListener("click", onSell);
}

async function init() {
  await requireSession();
  bindUI();

  await loadConfig();
  await loadPlayer();
  await loadInventory();

  setTab("buy");
}

init();
