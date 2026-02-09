## 1. Propósito de este documento

Este documento define **qué sistemas están activos y disponibles** en el MVP.

Un sistema incluido debe:
- Ser jugable (aunque sea de forma mínima)
- Contribuir directamente al loop central
- Representar la versión más simple posible del sistema final
- Poder expandirse sin refactor estructural

Si un sistema no cumple estos criterios, no debe incluirse en el MVP.

---

## 2. Sistemas incluidos en el MVP

### 2.1 Exploración (versión mínima)

La exploración es el eje principal del MVP.

Incluye:
- Un sector de espacio limitado
- Visibilidad parcial del mapa
- Señales como puntos de interés

Las señales:
- Se generan de forma procedural simple
- Contienen información incompleta
- Representan oportunidades y riesgos

No existe exploración profunda, mapas complejos ni rutas largas.

---

### 2.2 Sistema de señales

Las señales son la **fuente principal de decisiones**.

Cada señal define:
- Un tipo (ej: recurso, estructura, anomalía)
- Un nivel aproximado de riesgo
- Una posible recompensa

El jugador nunca conoce toda la información antes de interactuar.

Este sistema actúa como base para:
- futuros eventos
- misiones
- contratos
- encuentros especiales

---

### 2.3 Nave y estado persistente

El jugador controla una única nave.

La nave tiene:
- Casco base
- Combustible
- Capacidad de carga
- Estado de daño

Todos estos valores:
- Son persistentes
- Se modifican como consecuencia directa de decisiones
- Afectan el loop siguiente

No existen múltiples naves ni personalización avanzada.

---

### 2.4 Recursos (set mínimo)

El MVP incluye un **conjunto reducido de recursos**.

Características:
- Se obtienen a través de señales
- Ocupan espacio de carga
- Tienen un valor económico simple

No existen:
- cadenas de producción
- refinamiento
- recursos compuestos

Cada recurso es un “placeholder” del sistema económico completo.

---

### 2.5 Economía básica (venta)

La economía del MVP es **unidireccional**.

Incluye:
- Un único punto seguro
- Venta directa de recursos
- Precios fijos o con variación mínima

No existen:
- subastas
- contratos
- especulación
- mercado entre jugadores

El objetivo es cerrar el loop, no simular una economía compleja.

---

### 2.6 Interacción / acción

Cada señal activa una **interacción simple**, que puede ser:
- un minijuego liviano
- una decisión binaria o múltiple
- una acción con timing básico

El resultado:
- Nunca es completamente seguro
- Está influenciado por el estado de la nave
- Puede generar consecuencias negativas

Este sistema es la base para futuros minijuegos más complejos.

---

### 2.7 Progresión inicial (implícita)

No existe sistema de niveles.

La progresión se manifiesta a través de:
- Mejor interpretación de la información
- Decisiones más eficientes
- Reducción de errores

Cualquier mejora numérica explícita queda fuera del MVP.

---

### 2.8 Persistencia de sesión

El estado del jugador se guarda entre sesiones.

Persisten:
- Estado de la nave
- Recursos
- Información descubierta

Esto refuerza la sensación de consecuencias reales.

---

## 3. Principios de implementación

Todos los sistemas incluidos deben cumplir:

- Simplicidad sobre completitud
- Datos antes que contenido
- Consecuencias visibles
- Extensibilidad futura

Si una implementación requiere complejidad extra “por las dudas”, debe simplificarse o eliminarse.

---

## 4. Relación con sistemas futuros

Cada sistema incluido representa:
> el primer caso funcional de un sistema más amplio

Las futuras actualizaciones:
- ampliarán profundidad
- agregarán variantes
- introducirán nuevas interacciones

Pero **no reemplazarán** estos sistemas base.
