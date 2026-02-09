## 1. Propósito de este documento

Este documento define la **visión técnica general** del proyecto y actúa como punto de entrada a la arquitectura del juego.

Su objetivo es:
- traducir el diseño del MVP a decisiones técnicas concretas
- fijar principios arquitectónicos
- evitar contradicciones entre implementación y diseño
- servir como referencia para desarrollo presente y futuro

Este documento **no redefine el MVP**.  
Lo implementa.

---

## 2. Relación con el MVP

La arquitectura técnica está diseñada para soportar el MVP definido en:

- `docs/mvp/00_objective.md`
- `docs/mvp/01_playable_loop.md`
- `docs/mvp/02_included_systems.md`
- `docs/mvp/03_excluded_systems.md`
- `docs/mvp/04_minimal_content.md`
- `docs/mvp/05_success_criteria.md`

Todas las decisiones técnicas deben:
- respetar el loop central
- preservar las consecuencias persistentes
- evitar introducir sistemas excluidos en el MVP

Si una decisión técnica entra en conflicto con el MVP, **la arquitectura debe ajustarse**, no el diseño.

---

## 3. Principios arquitectónicos

### 3.1 Servidor autoritativo

El servidor es la única fuente de verdad.

- El cliente nunca calcula resultados
- El cliente solo envía intenciones
- Toda validación ocurre en backend
- La base de datos refleja el estado real del universo

Este principio es clave para:
- seguridad
- anti-cheat
- persistencia
- escalabilidad futura

---

### 3.2 Tick-based world simulation

El mundo del juego avanza mediante un sistema de **ticks de 1 segundo**, controlados por el servidor.

- El tiempo del cliente no es confiable
- No existe progreso offline automático
- Las acciones se resuelven en función de ticks

Este modelo:
- simplifica validaciones
- evita exploits temporales
- facilita auditoría de acciones

---

### 3.3 Modelo de acciones bloqueantes

Un jugador puede tener **una sola acción activa a la vez**.

- Las acciones tienen duración en ticks
- Mientras una acción está en progreso, no pueden iniciarse otras
- El resultado se calcula al finalizar la acción

Este modelo:
- refuerza el peso de las decisiones
- simplifica la lógica de juego
- reduce vectores de abuso

---

### 3.4 Cliente liviano y desacoplado

El cliente es una aplicación liviana, orientada a interfaz y experiencia de usuario.

- No contiene lógica sensible
- No simula el mundo
- No mantiene estado crítico
- Puede ser reiniciado sin pérdida de progreso

El cliente es intercambiable mientras respete el contrato con el servidor.

---

### 3.5 Persistencia desde el inicio

El estado del juego se persiste desde el primer momento en una base de datos real.

- No existen estados temporales críticos
- No se confía en almacenamiento local
- Las validaciones se refuerzan a nivel de backend y DB

Esto permite:
- trazabilidad
- detección de anomalías
- evolución a MMO real sin migraciones traumáticas

---

## 4. Alcance técnico del MVP

El MVP implementa:

- Cliente individual (sin interacción entre jugadores)
- PvE localizado
- Exploración y señales
- Economía básica
- Persistencia total
- Generación procedural controlada

Quedan fuera del MVP:
- chat
- PvP
- interacción social
- simulación global compleja

La arquitectura debe permitir agregar estos sistemas **sin reescribir la base**.

---

## 5. Generación y expansión del universo

El universo del juego se construye de forma progresiva:

- Existe una seed global inicial
- Contiene sistemas base predefinidos
- Nuevos sistemas se generan bajo condiciones específicas
- La exploración controla el ritmo de expansión

Este enfoque:
- limita crecimiento descontrolado
- refuerza la exploración
- reduce carga técnica innecesaria

---

## 6. Seguridad por diseño

La seguridad no se agrega al final.

El diseño arquitectónico:
- limita acciones concurrentes
- valida todas las intenciones
- controla el tiempo desde el servidor
- registra eventos críticos

El objetivo no es eliminar trampas, sino **hacerlas costosas, visibles y poco rentables**.

---

## 7. Escalabilidad consciente

El MVP no está sobredimensionado, pero:

- evita decisiones irreversibles
- separa responsabilidades
- mantiene contratos claros entre componentes

La arquitectura está pensada para crecer de forma horizontal sin romper el MVP validado.

---

## 8. Estructura de la documentación técnica

Este documento es el primero de una serie que detalla la arquitectura:

- `01_time_and_ticks.md`
- `02_action_model.md`
- `03_client_server_model.md`
- `04_persistence_and_db.md`
- `05_security_and_anti_cheat.md`
- `06_scalability_notes.md`

Cada documento profundiza un aspecto específico sin duplicar información.

---

## 9. Valor estratégico de esta arquitectura

Esta arquitectura existe para:

- proteger el diseño
- habilitar desarrollo incremental
- facilitar mantenimiento
- permitir iteración sin colapsar el sistema

No busca ser perfecta.  
Busca ser **correcta para este juego**.
