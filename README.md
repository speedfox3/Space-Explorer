I just want to do a mix of ogame and eve online. I really like the exploration of eve online, but not so much into pvp. also love that idea of sending a space probe to a inhabit plante to check for resources. I think the games today are too much code for nonsense. I believe in small games, no graphic but with content and good ideas. something like tetris. 

I Dunno, just trying things. 


1) state.js

Responsabilidad: estado global único del cliente (sin lógica).

Variables que tenés hoy en game.js:

let currentPlayer = null;

let currentShip = null;

let currentSystemObjects = [];

Exporta:

getters/setters:

getCurrentPlayer(), setCurrentPlayer(p)

getCurrentShip(), setCurrentShip(s)

getCurrentSystemObjects(), setCurrentSystemObjects(arr)

✅ Ventaja: evitás que 8 archivos modifiquen globals a lo loco.

2) math.js

Responsabilidad: helpers puros (sin DOM, sin supabase).

De tu game.js van acá:

distance(a, b)

3) balance.js

Responsabilidad: fórmulas del juego (radar, movimiento, consumo) para que mañana metas upgrades/buffs sin romper nada.

De tu game.js van acá:

getEffectiveRadarRange(player, ship) ✅ (ojo: hoy lo tenés)

y dejá acá constantes de balance (si las tenés en el archivo).

También debería vivir acá (nuevo, recomendado):

getMovementStats(player, ship) (si luego querés hacerlo)

computeMoveCost(dist, player, ship)

computeTravelTimeMs(dist, player, ship)

4) ui.js

Responsabilidad: todo lo que toca DOM y “render”.

De tu game.js van acá:

updateBatteryBar(current, max)

updateCargoBar(used, capacity)

updateDefenseBar(ship)

renderPlayer(player, ship) ⚠️ solo una (tenés 2 versiones hoy)

setMoveInputsFromPlayer(player)

renderTravelStatus(player)

clearTravelStatus()

👉 Nota: hoy en tu game.js aparece renderPlayer dos veces; elegimos la “buena” y borramos la otra.

5) movement.js

Responsabilidad: moverse y todo lo relacionado a viaje + colisiones.

De tu game.js van acá:

isOccupied(x, y)

findNearestFreeSpot(x, y, maxRadius)

handleMove() (si lo usás como handler del botón)

moveTo(targetX, targetY)

finalizeTravel()

startTravelTimer() (nuevo si querés UI con countdown constante)

👉 movement.js importa:

estado desde state.js

distance desde math.js

balance desde balance.js

UI desde ui.js

supabase client desde supabase.js (tu archivo actual)

6) world.js

Responsabilidad: cargar mundo, objetos, visibilidad, descubrimientos.

De tu game.js van acá:

loadAndRenderSystemObjects(player, ship)

renderObjectCard(...) (si querés mantenerlo junto al mundo; si toca DOM, también puede ir a ui.js, pero está ok acá si solo devuelve string)

Y acá también deberían ir (cuando avances):

markDiscoveredObjects(player, visibleObjects)

fetchDiscoveredObjects(player, systemId)

👉 world.js importa:

getEffectiveRadarRange/canSee desde balance.js

distance desde math.js

interactWithObject desde interactions.js (para bindear botones)

setCurrentSystemObjects desde state.js

7) interactions.js

Responsabilidad: qué pasa cuando apretás “Interactuar” (y luego minijuegos).

De tu game.js va acá:

interactWithObject(obj)

Más adelante lo ideal:

interactWithObject() solo llama a un dispatcher:

handleStar(obj)

handleBlackHole(obj)

handleMining(obj)

etc.

8) auth-ui.js (opcional)

Responsabilidad: logout y cosas de sesión.

De tu game.js va acá:

logout()
