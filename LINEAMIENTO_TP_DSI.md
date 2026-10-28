# Lineamiento del TP Integrador — BarrioAlerta

**Materia:** Diseño de Sistemas de Información (DSI) — UTN FRBA, Plan 23 · **Año:** 2026
**Stack:** TypeScript (Node + Express en el back, React en el front)

---

## 1. Resumen

**BarrioAlerta** es una plataforma web para gestionar reclamos de la vía pública (baches, luminarias apagadas, basurales, árboles caídos). Un **vecino** reporta el problema con foto y ubicación en un mapa. Un **operador municipal** lo valida y lo asigna a una **cuadrilla** con ayuda de un algoritmo. La cuadrilla lo resuelve con una foto de evidencia y el vecino recibe notificaciones en cada paso. Cada tipo de reclamo tiene un **plazo de atención (SLA)**: una tarea programada detecta los vencidos y los escala.

---

## 2. Alcance

### 2.1 Qué entra

| # | Funcionalidad |
|---|---|
| M1 | Login con roles (Vecino, Operador, Cuadrilla, Admin) y acceso rápido con usuarios demo |
| M2 | Reportar incidente: tipo, pin en el mapa, foto, descripción |
| M3 | Sumarse a un reclamo existente desde el mapa; el operador marca duplicados a mano |
| M4 | Ciclo de vida con **State** + historial (quién, qué, cuándo, motivo) |
| M6 | Propuestas de asignación de cuadrilla con 2 estrategias (cercanía / menor carga) |
| M7 | Vista de cuadrilla: iniciar y resolver con foto |
| M8 | Notificaciones por eventos: in-app + email, SMS y WhatsApp simulados |
| M9 | SLA por tipo + tarea programada de escalamiento, con **reloj de demo** |
| M10 | Mapa público (sin datos personales) y mapa operativo |
| M11 | Importación del padrón de vecinos por CSV (10.000 filas) |
| M12 | Panel admin: tipos de incidente y SLA, cuadrillas, bandeja de notificaciones simuladas |

---

## 3. Actores y requerimientos

| Actor | Qué hace |
|---|---|
| **Visitante** | Ve el mapa público y se registra |
| **Vecino** | Reporta, adhiere, sigue sus reclamos, confirma o reabre (7 días), elige su canal de notificación |
| **Operador municipal** | Valida, rechaza (con motivo), marca duplicados y asigna cuadrillas |
| **Miembro de cuadrilla** | Inicia y resuelve con foto los incidentes de su cuadrilla |
| **Administrador** | Configura tipos y SLA, cuadrillas; importa el padrón de vecinos |
| **Reloj** (secundario) | Escala los incidentes con el SLA vencido |

Operador y Administrador no son clases de dominio: son un `Usuario` con un rol.

**Requerimientos no funcionales**:

| Característica ISO 25010 | Requerimiento |
|---|---|
| Fiabilidad | El guion de la demo corre 3 veces seguidas sin falla en cada máquina |
| Recuperabilidad | El entorno de demo se restaura en < 60 s con un comando |
| Usabilidad | Reportar un incidente toma ≤ 3 pasos y < 60 s para alguien nuevo |
| Accesibilidad | Pantallas del vecino con WCAG AA; Lighthouse ≥ 90 |
| Seguridad | Toda transición registra actor y fecha; un rol sin permiso recibe 403 |
| Mantenibilidad | Agregar una estrategia nueva no modifica clases existentes |

---

## 4. Decisiones de diseño

El resumen con ventajas y costos de cada una está en [`docs/justificaciones.md`](docs/justificaciones.md).

- **D1. Modelo de dominio rico** en el agregado `Incidente`: las reglas de cada estado viven en el dominio y los servicios solo orquestan.
- **D2. Aplicación multimódulo en un solo proceso**, no microservicios: para una demo en 1–2 notebooks, varios procesos son más puntos de falla.
- **D3. State** para el ciclo de vida. Cada estado redefine solo sus transiciones; el resto se rechaza (HTTP 409). El cambio pasa siempre por `Incidente.cambiarEstado`, el único que agrega al historial. El escalamiento **no** es un estado, porque no cambia el comportamiento.
- **D4. Strategy** para los dos algoritmos de asignación: por cercanía y por menor carga. Agregar un criterio es agregar una clase. La UI muestra las dos propuestas lado a lado.
- **D5. Eventos de dominio**: el incidente registra eventos y el servicio los publica después de guardar. Notificaciones se suscribe; el incidente no lo conoce. `ServicioNotificaciones` es un Facade y los canales son Adapters elegidos por una Simple Factory.
- **D6. Persistencia:** PostgreSQL con ORM; desnormalización de `estado` y `cantidad_adhesiones`; fotos en disco. Notificaciones en **MongoDB con Mongoose** como ODM: cada notificación es un documento independiente que se agrega y se lee por destinatario.
- **D7. Reloj inyectado**: todo lo que usa "la hora actual" recibe un `Reloj`. En la demo, un `RelojDeDemo` congelado que solo avanza con un botón ("+48 h"), así el SLA vence cuando lo decidimos.

**API REST**: recursos sin verbos en la URL, códigos HTTP correctos y nunca 200 con error. Por ejemplo: `POST /api/incidentes`, `POST /api/incidentes/{id}/cambios-de-estado`, `GET /api/incidentes/{id}/propuestas-asignacion?estrategia=`, `POST /api/importaciones`. Colección de Postman.

---

## 5. Diagramas a entregar

Están en [`docs/diagramas/`](docs/diagramas/README.md).

| Diagrama | Hito |
|---|---|
| Casos de uso | H0 |
| Clases, uno por módulo | H0 → H3 |
| Estados del incidente | H0 |
| Componentes | H1 |
| Despliegue | H1 |
| DER físico | H1 → H4 |

---

## 6. UI/UX

| Rol | Pantalla |
|---|---|
| Público | Landing con mapa; login con botones de usuarios demo |
| Vecino | Mapa con botón "Sumarme" en cada reclamo; reportar (3 pasos); detalle con línea de tiempo del historial; notificaciones |
| Operador | Bandeja por estado; modal de asignación con las dos propuestas |
| Cuadrilla | Mis tareas; resolver con foto |
| Admin | Importar CSV; bandeja de notificaciones simuladas; panel de demo (reloj) |

---

## 7. Plan por hitos

| Hito | Objetivo | Terminado cuando |
|---|---|---|
| **H0 — Concepción** | Diagramas v0, bocetos de baja fidelidad, repo y CI | --- |
| **H1 — Recorrido completo** | Reportar → validar → asignar (manual) → iniciar → resolver → cerrar, con PostgreSQL, login con token y mapa | --- |
| **H2 — Algoritmos y gestión** | 2 estrategias de asignación + modal de propuestas; sumarse desde el mapa; ABM de tipos y cuadrillas | Las dos estrategias proponen cuadrillas distintas para el mismo incidente |
| **H3 — Eventos y tiempo** | Notificaciones (canales simulados); tarea programada de SLA + reloj de demo; importación CSV de 10.000 vecinos | Asignar notifica al vecino; "+48 h" escala el incidente correcto |
| **H4 — Pulido** | UI de las pantallas del guion; accesibilidad; diagramas finales; tag `v1.0-demo` | --- |
| **H5 — Ensayo** | Ensayos cronometrados, video de respaldo, slides, preguntas | ≥ 10 ensayos; los 3 últimos sin falla; entre 11 y 13 min |

---

## 8. Demo

- **Guion minuto a minuto:** [`demo/guion.md`](demo/guion.md) (objetivo: 12 min + 3 de margen). Si un paso falla no se reintenta: se sigue desde un incidente de respaldo que ya está en el estado siguiente.
- **Datos precargados:** [`demo/seed/README.md`](demo/seed/README.md): 7 usuarios demo, 5 tipos, 3 cuadrillas con cargas distintas (para que las dos estrategias propongan cuadrillas distintas), ~60 incidentes y 10.000 vecinos importados por CSV.
- **Checklist del día:** [`demo/checklist.md`](demo/checklist.md).
