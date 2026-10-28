# BarrioAlerta

Plataforma para gestionar reclamos de la vía pública (baches, luminarias, basurales, árboles caídos).
Un vecino reporta con foto y ubicación, el municipio lo valida y lo asigna a una cuadrilla, y el vecino sigue el avance en un mapa.

TP integrador de **Diseño de Sistemas de Información** — UTN FRBA, 2026.
El lineamiento completo del trabajo está en [`LINEAMIENTO_TP_DSI.md`](LINEAMIENTO_TP_DSI.md).

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js 22 · TypeScript · Express 5 · PostgreSQL 16 · MongoDB 8 (notificaciones) |
| Frontend | React · TypeScript · Vite · MUI (Material Design) · react-leaflet |
| Tests | Vitest · Supertest |

## Requisitos

- **Node.js 22** (o ≥ 20.19).
- **PostgreSQL 16**, con base, usuario y contraseña `barrioalerta`. Dos opciones:
  - nativo (instalador oficial para Windows), y después crear la base con [`backend/db/crear-base.sql`](backend/db/crear-base.sql);
  - Docker Desktop (`docker compose up -d`), que necesita WSL 2 habilitado.
- **MongoDB 8 Community** (para las notificaciones), sin usuario ni contraseña, en el puerto 27017. Nativo (instalador oficial para Windows, como servicio) o con el mismo `docker compose up -d`.

## Tests

```bash
npm test
```

Incluye la **tabla de transiciones del incidente**: cada flecha del diagrama de estados es un caso de test, y cada combinación estado × acción que no está en el diagrama se verifica que sea rechazada.

## Estructura

```
barrioalerta/
├── backend/                 Node + Express, arquitectura en capas
│   ├── src/
│   │   ├── app.ts           rutas y middlewares
│   │   ├── server.ts        levanta el servidor (y el reloj de demo con --demo)
│   │   ├── routes/          endpoints por recurso
│   │   ├── controllers/     leen el pedido HTTP y llaman al servicio
│   │   ├── services/        casos de uso: orquestan modelos y repositorios
│   │   ├── repositories/    acceso a PostgreSQL (ORM) y MongoDB (Mongoose)
│   │   ├── models/          dominio: Incidente, estados (State), cuadrillas, estrategias (Strategy)
│   │   ├── errors/          AppError y sus subclases con código HTTP
│   │   ├── middlewares/     manejo de errores y rutas inexistentes
│   │   └── utils/           reloj y reloj de demo
│   └── tests/               domain/, utils/, integration/
├── frontend/                React + Vite + MUI
│   └── src/                 api/, hooks/, pages/, components/, styles/, utils/
├── docs/                    justificaciones de diseño y diagramas
├── demo/                    guion, checklist, ensayos, seed, script de reset
└── docker-compose.yml
```

Módulos pendientes: `notificaciones/` (Observer, Facade, Adapter: email, SMS y WhatsApp simulados) e `importacion/` (CSV de más de 10.000 filas, Template Method).

## Estado

| Hito | Estado |
|---|---|
| H0 — Concepción | En curso. Hecho: esqueleto del repo, núcleo de estados con tests, diagramas v0. Falta: bocetos |
| H1 — Esqueleto de punta a punta | Pendiente |
| H2 — Inteligencia del dominio | Pendiente |
| H3 — Eventos, tiempo e integración | Pendiente |
| H4 — Pulido y validación | Pendiente |
| H5 — Ensayo | Pendiente |
