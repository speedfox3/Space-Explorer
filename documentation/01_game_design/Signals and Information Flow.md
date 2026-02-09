## 1. ¿Qué es una señal?

Una **señal** representa la localización física de un objeto en el espacio.

Ejemplos:
- planeta
- asteroide
- nave abandonada
- anomalía
- fuente de distress

Una señal **no es**:
- un reward
- un loot
- una interacción
- una acción resolutiva

La señal es información en bruto:  
una dirección espacial hacia algo que existe.

---

## 2. Persistencia de las señales

Una vez descubierta, una señal:

- permanece visible para el jugador
- no desaparece por ser analizada
- no se consume
- no depende de una acción posterior

La señal existe independientemente del jugador.  
El jugador solo accede a su conocimiento.

---

## 3. Rol del explorador

El explorador:

- no interactúa físicamente con objetos
- no extrae recursos
- no resuelve planetas, asteroides o naves

Su gameplay está basado en **información**:

- detectar señales
- geolocalizar objetos
- estimar propiedades
- mejorar precisión
- vender o compartir información

El valor que produce el explorador es **conocimiento**, no materiales.

---

## 4. Filosofía de interacción

Las señales son pasivas.

Toda interacción:
- es una acción explícita del jugador
- consume tiempo (ticks)
- consume recursos
- puede fallar

El resultado de una interacción **no es loot**, sino información más precisa.

---

## 5. Minijuegos (futuro)

Las interacciones reales con objetos se resolverán mediante **minijuegos**.

El backend:
- autoriza la acción
- define parámetros
- valida resultados
- aplica consecuencias

El cliente:
- ejecuta el minijuego
- envía inputs

Los minijuegos **no forman parte del MVP**,  
pero la arquitectura debe soportarlos.

---

## 6. Qué NO son las señales

Las señales no son:

- consumibles
- recompensas
- contenedores de loot
- eventos temporales
- interacciones directas

Las señales son **anclas de conocimiento**, no endpoints jugables.

---

## 7. Interpretación en el MVP

Para el MVP:

- descubrir señales valida la exploración
- analizar señales valida acciones de larga duración
- los resultados pueden simplificarse o mockearse

Estas simplificaciones **no definen el diseño final del juego**.
