# Core Gameplay Loop

Este documento describe **qué hace el jugador cuando juega Space Explorer**, cómo se encadenan las acciones principales y cómo el juego evita tiempos muertos o progreso puramente pasivo.

El core gameplay loop conecta todos los sistemas definidos previamente y garantiza que **siempre haya decisiones significativas**, independientemente del tiempo disponible del jugador.

---

## 1. Principio Central

El gameplay de Space Explorer se basa en un ciclo simple:

> **Información → Decisión → Acción → Consecuencia → Nueva Información**

El jugador nunca está esperando sin contexto. Siempre está:

* interpretando información
* tomando decisiones
* aceptando riesgos

---

## 2. Loop Principal (Universal)

Este loop aplica a todos los jugadores, independientemente del rol:

1. **Entrada al juego**

   * el jugador revisa estado de naves, mercado y señales

2. **Evaluación de oportunidades**

   * señales detectadas
   * precios de mercado
   * estado de infraestructura

3. **Decisión**

   * explorar
   * explotar
   * comerciar
   * arriesgar

4. **Acción**

   * viaje
   * minijuego
   * transacción

5. **Resultado**

   * ganancia
   * pérdida
   * información nueva

6. **Reinversión**

   * mejoras
   * expansión
   * cambio de estrategia

---

## 3. Loops por Rol

### 🧭 Explorador

**Loop típico:**

* entrar a un sistema
* analizar señales
* reducir incertidumbre
* descubrir objeto
* reclamar o vender información
* reinvertir en equipo

El explorador puede completar ciclos cortos (15–30 min) o largos (descubrimientos estratégicos).

---

### ⛏️ Minero

**Loop típico:**

* localizar fuente de recursos
* decidir arrendar o comprar derechos
* extraer recursos
* gestionar desgaste
* vender o transportar
* optimizar flota

Puede operar varias naves en paralelo.

---

### 📦 Comerciante

**Loop típico:**

* analizar mercados
* detectar desbalances
* mover mercancía
* vender o subastar
* reinvertir en rutas o infraestructura

El comerciante juega con información y timing.

---

### 🏴‍☠️ Oportunista

**Loop típico:**

* detectar tráfico
* evaluar riesgo
* atacar NPCs o restos
* extraer botín
* evadir represalias

El loop es intenso pero irregular.

---

### 🛠️ Ingeniero

**Loop típico:**

* obtener blueprints
* adquirir materiales
* fabricar o mejorar
* vender servicios u objetos
* reinvertir en capacidad

Opera tanto en tiempo real como en segundo plano.

---

## 4. Sesiones de Juego

### Sesión Corta (10–20 min)

* revisión de estado
* una acción clara
* decisión rápida

Ejemplo:

* escanear una señal
* vender recursos
* ajustar órdenes

---

### Sesión Media (30–60 min)

* exploración completa de un sistema
* ejecución de minijuegos
* comercio activo

---

### Sesión Larga (2+ horas)

* descubrimientos estratégicos
* expansión de infraestructura
* gestión de múltiples naves

---

## 5. Eliminación de Tiempos Muertos

Space Explorer evita:

* timers largos obligatorios
* espera pasiva sin decisiones

Si una acción requiere tiempo:

* el jugador puede ejecutar otra
* o delegar a naves secundarias

---

## 6. Progreso sin Dominio por Tiempo

El progreso se basa en:

* calidad de decisiones
* eficiencia
* información

No en:

* horas conectadas
* repetición mecánica

---

## 7. Feedback Constante

Cada acción genera:

* feedback inmediato
* consecuencias visibles

El jugador entiende por qué ganó o perdió.

---

## 8. Misiones Diarias y Semanales

Las **misiones** funcionan como una capa adicional del core gameplay loop. No reemplazan la exploración libre ni la economía emergente, sino que:

* orientan al jugador
* generan objetivos claros
* inyectan dinero y recursos de forma controlada

Las misiones nunca son obligatorias.

---

### 8.1 Misiones Diarias

**Objetivo:**

* ofrecer recompensas inmediatas
* dar motivos claros para sesiones cortas

Características:

* objetivos simples y acotados
* alineadas con el rol del jugador
* completables en 10–30 minutos

Ejemplos:

* escanear una anomalía
* vender cierto volumen de recursos
* fabricar o reparar un módulo

Recompensas:

* créditos
* consumibles
* bonificaciones temporales

Las misiones diarias ayudan a:

* mantener flujo de dinero
* reducir frustración
* facilitar progreso constante

---

### 8.2 Misiones Semanales

**Objetivo:**

* introducir competencia controlada
* generar hitos de alto impacto

Características:

* objetivos más complejos
* duración limitada
* seguimiento global

Las misiones semanales pueden:

* involucrar descubrimientos
* incentivar comercio o producción
* fomentar riesgo calculado

---

### 8.3 Rankings y Recompensas

Las misiones semanales generan un **ranking**:

* los mejores resultados obtienen recompensas mayores
* los premios son significativos pero no decisivos

Tipos de recompensas:

* créditos elevados
* blueprints raros
* bonificaciones únicas

El sistema está diseñado para:

* premiar eficiencia y estrategia
* no favorecer exclusivamente al jugador con más tiempo

---

## Principios Finales

* Siempre hay algo útil que hacer
* El riesgo es opcional, nunca obligatorio
* El jugador define su ritmo

---

> *Space Explorer no te dice qué hacer: te muestra el estado del universo y te deja decidir.*
