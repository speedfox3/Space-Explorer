## 1. Propósito del MVP

El objetivo del MVP es **validar el loop central del juego**, demostrando que la experiencia de:

> obtener información incompleta → tomar una decisión → asumir un riesgo → recibir una consecuencia persistente

es **interesante, comprensible y repetible** para el jugador.

Este MVP no busca representar la totalidad del diseño final, sino probar que el **núcleo conceptual del juego funciona** en una versión mínima, jugable y extensible.

---

## 2. Qué debe demostrar este MVP

Al finalizar una sesión corta (15–30 minutos), el jugador debería haber experimentado:

- La necesidad de **interpretar información imperfecta**
- La sensación de **riesgo real** al tomar decisiones
- Consecuencias claras y persistentes de sus acciones
- Una primera noción de **especialización** (no todos los jugadores juegan igual)
- Un incentivo claro para **volver a jugar**

Si estas sensaciones no aparecen, el MVP se considera fallido, independientemente de su estabilidad técnica.

---

## 3. Qué NO es este MVP

Este MVP **no es**:

- Un vertical slice cinematográfico
- Un tutorial completo de todos los sistemas
- Una demo de contenido
- Una simulación económica avanzada
- Una representación fiel del endgame

Cualquier sistema que no contribuya directamente al loop central queda fuera de alcance.

---

## 4. Criterio de éxito

El MVP se considera exitoso si:

- Un jugador nuevo puede entender el loop principal sin explicaciones externas
- Las decisiones generan tensión (no son triviales ni obvias)
- Las consecuencias se sienten justas, incluso cuando son negativas
- El jugador expresa curiosidad por:
  - mejorar su forma de jugar
  - acceder a más información
  - desbloquear nuevas opciones

El éxito del MVP **no se mide por cantidad de contenido**, sino por la calidad del ciclo de decisión.

---

## 5. Relación con el diseño completo

Este MVP es una **subconjunto deliberado** del diseño global.

Todos los sistemas incluidos deben:
- existir en el diseño final
- ser extensibles sin refactor estructural
- comportarse como el “primer caso” de una familia mayor de sistemas

Los sistemas no incluidos:
- no invalidan el diseño completo
- podrán incorporarse progresivamente mediante actualizaciones futuras

El MVP actúa como una **base estable** sobre la cual crecer horizontalmente.

---

## 6. Filosofía de evolución

Las futuras actualizaciones deberán:

- Agregar profundidad, no complejidad innecesaria
- Expandir sistemas existentes antes de crear nuevos
- Mantener el foco en decisión, información y riesgo

Si una actualización no refuerza estos pilares, debe ser cuestionada.
