# Minigames System

Este documento define la **filosofía y diseño de los minijuegos** de Space Explorer.

Los minijuegos no son distracciones ni pruebas de reflejos arbitrarias: son **momentos de decisión**, donde el jugador puede **reducir riesgo, aumentar valor o aceptar pérdidas**.

Un minijuego nunca bloquea el progreso, pero **siempre impacta el resultado**.

---

## 1. Principios de Diseño de Minijuegos

Todos los minijuegos deben cumplir las siguientes reglas:

* No deben requerir reflejos rápidos
* Deben poder completarse en menos de 30–60 segundos
* Deben premiar atención y comprensión
* Deben escalar en dificultad
* Nunca deben ser obligatorios para jugar

Un jugador ocasional siempre puede optar por:

* resolver el minijuego rápidamente
* aceptar un resultado subóptimo

Un jugador habilidoso puede:

* optimizar resultados
* reducir pérdidas
* maximizar beneficios

---

## 2. Minijuego de Escaneo

### Propósito

Reducir la **incertidumbre** de una señal y mejorar la calidad de la información obtenida.

---

### Contexto de Uso

* Exploración de sistemas solares
* Localización de objetos
* Identificación de anomalías

---

### Mecánica Base

El jugador interactúa con una representación abstracta de la señal:

* patrones incompletos
* ruido
* interferencias

El objetivo es:

* filtrar ruido
* alinear patrones
* estabilizar la señal

---

### Resultados

* **Éxito alto**: coordenadas precisas, nivel correcto
* **Éxito parcial**: coordenadas aproximadas, nivel estimado
* **Fallo**: información vaga o errónea

El fallo no destruye la señal, pero mantiene alta la incertidumbre.

---

## 3. Minijuego de Reclamación

### Propósito

Determinar el **valor potencial** de un objeto al ser reclamado.

---

### Contexto de Uso

* Reclamación de planetas
* Reclamación de asteroides
* Reclamación de anomalías económicas

---

### Mecánica Base

El jugador debe:

* estabilizar el objeto
* asignar recursos iniciales
* elegir entre rutas de explotación

Cada decisión implica:

* mayor riesgo
* mayor recompensa

---

### Resultados

* **Éxito completo**: recursos altos (100–500 m³)
* **Éxito parcial**: recursos reducidos
* **Fallo**: recursos mínimos, pero objeto reclamado

El objeto nunca se pierde por fallar.

---

## 4. Minijuego de Recuperación de Restos

### Propósito

Extraer valor de naves, estaciones o estructuras abandonadas.

---

### Contexto de Uso

* Exploradores
* Oportunistas
* Ingenieros

---

### Mecánica Base

El jugador gestiona:

* tiempo
* integridad estructural
* riesgo de colapso

Debe decidir:

* qué secciones recuperar
* cuándo retirarse

---

### Riesgo

Cada acción:

* aumenta el riesgo
* puede destruir partes del botín

---

## 5. Minijuego de Ingeniería

### Propósito

Optimizar fabricación, reparación o construcción.

---

### Contexto de Uso

* Creación de módulos
* Mejora de infraestructura
* Reparaciones complejas

---

### Mecánica Base

El jugador:

* ajusta parámetros
* equilibra eficiencia vs costo
* decide entre velocidad o calidad

---

### Resultados

* objetos más duraderos
* menor consumo
* reducción de costos futuros

---

## 6. Escalado de Dificultad

La dificultad de los minijuegos depende de:

* nivel del objeto
* nivel del módulo utilizado
* experiencia del jugador

Objetos de mayor nivel:

* tienen más variables
* toleran menos errores

---

## 7. Automatización Parcial

Con progresión avanzada:

* algunos minijuegos pueden automatizarse
* la automatización nunca es perfecta

Esto permite:

* gestionar múltiples naves
* reducir carga cognitiva

---

## 8. Principios Finales

* El minijuego mejora resultados, no habilita contenido
* Fallar no bloquea, pero sí cuesta
* Decidir rápido es válido, decidir bien es mejor

---

> *En Space Explorer, el verdadero desafío no es ganar el minijuego, sino decidir cuánto arriesgar.*
