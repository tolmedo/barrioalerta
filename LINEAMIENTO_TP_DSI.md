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
|---|---|---|
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

El resumen con ventajas y costos de cada una está en [`docs/justificaciones.md`](docs/justificaciones.md), que es el entregable "Justificaciones de Diseño".

- **D1. Modelo de dominio rico** en el agregado `Incidente`: las reglas de cada estado viven en el dominio y los servicios solo orquestan. Responde la pregunta de discusión de la E1.
- **D2. Aplicación multimódulo en un solo proceso** (lo que pide la E1), no microservicios: para una demo en 1–2 notebooks, varios procesos son más puntos de falla (`C21 · Clase_21_…_Microservicios`: conviene con gran escalabilidad o muchos subdominios, que no es el caso).
- **D3. State** para el ciclo de vida (`C03 · Patron State`). Cada estado redefine solo sus transiciones; el resto se rechaza (HTTP 409). El cambio pasa siempre por `Incidente.cambiarEstado`, el único que agrega al historial. El escalamiento **no** es un estado, porque no cambia el comportamiento (`C13`).
- **D4. Strategy** para los dos algoritmos de asignación que pide la E2: por cercanía y por menor carga (`C06 · PATRON STRATEGY`). Agregar un criterio es agregar una clase. La UI muestra las dos propuestas lado a lado, como la E2 muestra los dos rankings.
- **D5. Eventos de dominio** (`C10 · Observer`, `C10 · Patrón Subscripción de eventos`): el incidente registra eventos y el servicio los publica después de guardar. Notificaciones se suscribe; el incidente no lo conoce. `ServicioNotificaciones` es un Facade y los canales son Adapters elegidos por una Simple Factory (`C06`).
- **D6. Persistencia:** PostgreSQL con ORM **[Recomendación: TypeORM, por ser el más parecido a JPA de la `C17 · Guía de anotaciones de JPA`]**; desnormalización de `estado` y `cantidad_adhesiones`; fotos en disco. Notificaciones en **MongoDB con Mongoose** como ODM (E4, persistencia políglota): cada notificación es un documento independiente que se agrega y se lee por destinatario.
- **D7. Reloj inyectado** (`C07 · Inyeccion de dependencias`): todo lo que usa "la hora actual" recibe un `Reloj`. En la demo, un `RelojDeDemo` congelado que solo avanza con un botón ("+48 h"), así el SLA vence cuando lo decidimos.
- **D8. TypeScript** en back y front: un solo lenguaje para los 7. Los tipos e interfaces permiten mostrar que el código coincide con el diagrama de clases. El costo es que el material de la cátedra está en Java y hay que traducir los ejemplos.

**API REST** (`C02 · Cliente Servidor & API REST`): recursos sin verbos en la URL, códigos HTTP correctos y nunca 200 con error (`C13`). Por ejemplo: `POST /api/incidentes`, `POST /api/incidentes/{id}/cambios-de-estado`, `GET /api/incidentes/{id}/propuestas-asignacion?estrategia=`, `POST /api/importaciones`. Colección de Postman (`C02 · Ejemplo Practico API REST - POSTMAN`).

---

## 6. Diagramas a entregar

Solo los que pide el enunciado. Están en [`barrioalerta/docs/diagramas/`](barrioalerta/docs/diagramas/README.md), en Mermaid o PlantUML (StarUML si el docente lo prefiere).

| Diagrama | Lo pide | Dueño | Hito |
|---|---|---|---|
| Casos de uso (general) | E1 | I6 | H0 |
| Clases, uno por módulo (Incidentes, Asignación, Notificaciones; Importación en H3) | E1–E4 | I1, I3, I4, I2 | H0 → H3 |
| Estados del incidente | E2 | I1 | H0 |
| Componentes | E1, E2 | I7 | H1 |
| Despliegue | E1–E3, E6 | I7 | H1 |
| DER físico | E4 | I7 + I1 | H1 → H4 |

> **Regla de coherencia** (`C13`: "diagramas lindos pero inconsistentes entre sí"): si cambia el código, el diagrama se actualiza en el mismo PR.

---

## 7. UI/UX

**[Cátedra]** el front gráfico es obligatorio y se evalúa en vivo. Se siguen las "Consideraciones para el maquetado" de la E4 **[Enunciado]**: Material Design (MUI), profundidad de navegación ≤ 3, toasts para cada acción, loaders si la espera supera 300 ms, responsive, WCAG AA, zonas clickeables de 48×48 px y un único sistema de tokens (colores por estado del incidente).

Pantallas del guion, que son las que se hacen en alta fidelidad:

| Rol | Pantalla |
|---|---|
| Público | Landing con mapa; login con botones de usuarios demo |
| Vecino | Mapa con botón "Sumarme" en cada reclamo; reportar (3 pasos); detalle con línea de tiempo del historial; notificaciones |
| Operador | Bandeja por estado; modal de asignación con las dos propuestas |
| Cuadrilla | Mis tareas (mobile); resolver con foto |
| Admin | Importar CSV; bandeja de notificaciones simuladas; panel de demo (reloj) |

Bocetos: baja fidelidad en una sesión grupal (Excalidraw) y alta fidelidad con ayuda de IA, como sugiere la E1.

---

## 8. Plan por hitos

**Supuesto:** entrega en la semana del **7/12/2026**. **Feature freeze: domingo 29/11.** Si se confirma febrero, el tiempo extra va a ensayos, no a funcionalidades.

| Hito | Fechas | Objetivo | Terminado cuando |
|---|---|---|---|
| **H0 — Concepción** | 27/10 – 01/11 | Diagramas v0, bocetos de baja fidelidad, repo y CI | Los 7 pueden explicar el diagrama de estados; CI en verde |
| **H1 — Recorrido completo** | 02/11 – 08/11 | Reportar → validar → asignar (manual) → iniciar → resolver → cerrar, con PostgreSQL, login con token y mapa | El recorrido corre en las 2 notebooks; una transición inválida devuelve 409 |
| **H2 — Algoritmos y gestión** | 09/11 – 15/11 | 2 estrategias de asignación + modal de propuestas; sumarse desde el mapa; ABM de tipos y cuadrillas | Las dos estrategias proponen cuadrillas distintas para el mismo incidente |
| **H3 — Eventos y tiempo** | 16/11 – 22/11 | Notificaciones (canales simulados); tarea programada de SLA + reloj de demo; importación CSV de 10.000 vecinos | Asignar notifica al vecino; "+48 h" escala el incidente correcto |
| **H4 — Pulido (freeze 29/11)** | 23/11 – 29/11 | UI de las pantallas del guion; accesibilidad; diagramas finales; tag `v1.0-demo` | No entra nada nuevo después de esta fecha |
| **H5 — Ensayo** | 30/11 – entrega | Ensayos cronometrados, video de respaldo, slides, preguntas | ≥ 10 ensayos; los 3 últimos sin falla; entre 11 y 13 min |

Reglas: `main` siempre demostrable, ramas *feature* y PR con 1 revisión (`C21 · Integración Continua v3`); nada se mergea con tests en rojo.

---

## 9. División de trabajo

Cada integrante es dueño de una porción vertical (dominio + API + pantalla + diagrama + tests) y defiende su patrón en la exposición.

| Integrante | Responsabilidad | Defiende | Par de revisión |
|---|---|---|---|
| **I1** | Agregado `Incidente`, State, historial | State vs `switch`; modelo rico (pregunta E1) | I2 |
| **I2** | ABM de tipos, cuadrillas y vecinos; importación CSV de 10.000 vecinos (Template Method) | Template Method; desnormalización | I1 |
| **I3** | Asignación (las 2 estrategias + modal) y vista de cuadrilla | Strategy, OCP; State ≠ Strategy; tiempo real vs batch (pregunta E2) | I4 |
| **I4** | Eventos y notificaciones (Observer, Facade, Adapter, Factory) + campana | Sincrónico vs asincrónico; NoSQL vs relacional (pregunta E4) | I3 |
| **I5** | Front del vecino + mapa, sistema de diseño | SPA vs SSR (pregunta E5); accesibilidad | I6 |
| **I6** | Front del operador y admin + casos de uso | MVC; usabilidad (heurísticas de Nielsen) | I5 |
| **I7** | Plataforma: identidad y tokens, persistencia, tarea programada y reloj, CI, guion y reset de la demo | Monolito modular vs microservicios; inyección de dependencias | rota |

I5 e I6 escriben al menos un test de dominio y un endpoint cada uno; I1 a I4, al menos una pantalla cada uno.

> **[Cátedra]** `C01 · Formalidades de la asignatura` fija **máximo 5 integrantes**. Confirmar que 7 está aceptado (Anexo A7). Si hay que dividirse, se fusionan I5+I6 e I3+I4.

---

## 10. Demo

**[Cátedra]** 10–15 minutos, presencial, todos hablan, la demo no puede fallar, guion con datos precargados y ensayado muchas veces. Si falla, se pasa a la semana siguiente.

- **Guion minuto a minuto:** [`barrioalerta/demo/guion.md`](barrioalerta/demo/guion.md) (objetivo: 12 min + 3 de margen). Si un paso falla no se reintenta: se sigue desde un incidente de respaldo que ya está en el estado siguiente.
- **Datos precargados:** [`barrioalerta/demo/seed/README.md`](barrioalerta/demo/seed/README.md): 7 usuarios demo, 5 tipos, 3 cuadrillas con cargas distintas (para que las dos estrategias propongan cuadrillas distintas), ~60 incidentes y 10.000 vecinos importados por CSV.
- **Plan B:** reset en < 60 s; segunda notebook con el mismo tag; video con capítulos; slides con capturas.
- **Checklist del día:** [`barrioalerta/demo/checklist.md`](barrioalerta/demo/checklist.md).

---

## 11. Pruebas y preguntas de discusión

**Pruebas** (`OTROS MATERIALES · Testing - Validacion del DISEÑO`):

| Nivel | Qué | Herramienta |
|---|---|---|
| Unitario de dominio | La **tabla de transiciones** (cada flecha del diagrama de estados es un test), estrategias de asignación, SLA | Vitest |
| API | Códigos HTTP: 409, 401, 403 | Vitest + Supertest; colección de Postman |
| Validación | Prueba con 3 usuarios externos (RNF3) y ensayos de la demo (RNF1) | Planilla `demo/ensayos.md` |

**Preguntas de discusión del enunciado** (respuesta tentativa; todos deben poder defenderlas):

- **E1 — ¿Modelo rico o anémico?** Rico en `Incidente`, porque sus reglas cambian con el estado; en un modelo anémico serían `if` por estado repetidos en los servicios. Simple en `TipoIncidente` o `Cuadrilla`, que son casi datos.
- **E2 — ¿Asignación en tiempo real o batch?** La propuesta de cuadrilla se calcula al momento porque la pide una persona y es barata (3 cuadrillas). Lo que sí va por lotes es el control de SLA, en la tarea programada.
- **E4 — ¿NoSQL o relacional?** Relacional para incidentes, usuarios y cuadrillas, que tienen relaciones e integridad. Las notificaciones son registros independientes que solo se agregan y se leen por destinatario: si alguna parte va a una base documental, es esa (`C18 · Bases_de_Datos_NoSQL_2026`; `C21 · MoveAr`, caso D).
- **E5 — ¿SSR o SPA?** SPA, porque el mapa, la bandeja que se actualiza y el asistente de reporte son interactivos (`C19 · Arquitectura de Software Parte I`, clientes livianos y pesados). Se pierde primera carga y SEO, que no aplican a una herramienta con login.

---

## 12. Riesgos principales

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | El mapa necesita internet para las teselas | Si no cargan, los marcadores se ven igual sobre fondo neutro; probar con Wi-Fi apagado en H4 |
| R2 | Docker no funciona en una notebook (WSL 2 deshabilitado, confirmado el 27/10) | PostgreSQL y MongoDB instalados nativos, como servicios de Windows |
| R10 | MongoDB o PostgreSQL no están levantados al empezar | Se instalan como servicios con inicio automático; el checklist los verifica 30 min antes |
| R3 | Datos sucios de un ensayo anterior | Reset antes de cada ensayo |
| R4 | El SLA vence en un momento no planeado | Reloj de demo congelado (D7) |
| R5 | Merge de último momento rompe algo | Feature freeze 29/11 y tag `v1.0-demo` |
| R6 | Se pasan de 15 minutos | Cronometrar cada ensayo; bloques con tiempo fijo |
| R7 | Falta un integrante | Cada bloque tiene suplente (su par de revisión) |
| R8 | El alcance crece | La sección 3 es el contrato |
| R9 | La cátedra no acepta 7 integrantes | Consultar esta semana |

---

## 13. Próximos pasos (esta semana: 28/10 – 01/11)

1. **Consultar al docente** (un solo mensaje): ¿se aceptan 7 integrantes? ¿diciembre o febrero? ¿se acepta no hacer deploy? (Ya confirmados: el lenguaje es libre y se acepta React.)
2. **Reunión de arranque (2 h):** leer este lineamiento, asignar I1…I7.
3. **Sesión de modelado (2 h, todos):** casos de uso y diagrama de estados en el pizarrón; validar la tabla de transiciones; acordar el glosario (incidente, adhesión, SLA, escalamiento).
4. **Bocetos de baja fidelidad** de las pantallas del guion (I5, I6).
5. **PostgreSQL 16** instalado en las notebooks de la demo (I7). Hecho en la notebook de Tomás el 28/10, con la base creada por `backend/db/crear-base.sql`.
6. **MongoDB 8 Community** instalado como servicio en las mismas notebooks (I4 + I7).

---

## Anexo A — Contradicciones y resolución

| # | Fuente A | Fuente B | Resolución propuesta |
|---|---|---|---|
| A1 | **[Cátedra]** Sin deploy; corre local | **[Enunciado E6]** Deploy en la nube, observabilidad, gRPC o GraphQL | Sin deploy. Se entrega el diagrama de despliegue local |
| A2 | **[Cátedra]** Front gráfico obligatorio, sin tecnología impuesta | **[Enunciado E5]** Cliente liviano con motor de plantillas | **Resuelto:** el docente acepta React. Se mantiene la justificación (pregunta E5) |
| A3 | **[Cátedra]** Demo robusta en 1–2 máquinas | **[Enunciado]** Arquitectura en servicios | Aplicación multimódulo en un proceso (D2) |
| A4 | **[Enunciado E3]** Notificaciones por cola de mensajes | Demo sin infraestructura extra | Eventos asincrónicos en el mismo proceso; el broker queda documentado como evolución |
| A5 | **[Enunciado E2]** Notificaciones reales | **[Cátedra]** La demo no puede fallar | Canales simulados detrás de un Adapter, como en la E1 |
| A6 | **[Enunciado E4]** Un servicio en base documental con ODM | Una base más que instalar en cada notebook | **Resuelto:** Notificaciones en MongoDB (Mongoose); el resto en PostgreSQL |
| A7 | **[Cátedra]** `C01 · Formalidades`: máximo 5 integrantes | Grupo de 7 | Consultar al docente; plan alternativo en la sección 9 |
| A8 | **[Cátedra]** El material de la materia está en Java (Spring Boot, JPA) | El grupo elige TypeScript | **Resuelto:** el lenguaje es libre. Se usa TypeScript |
