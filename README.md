# BarrioAlerta

Plataforma para gestionar reclamos de la vía pública (baches, luminarias, basurales, árboles caídos).
Un vecino reporta con foto y ubicación, el municipio lo valida y lo asigna a una cuadrilla, y el vecino sigue el avance en un mapa.

TP integrador de **Diseño de Sistemas de Información** — UTN FRBA, 2026.
El lineamiento completo del trabajo está en [`../LINEAMIENTO_TP_DSI.md`](../LINEAMIENTO_TP_DSI.md).

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

## Cómo levantarlo

```bash
cd backend && npm install && npm run dev
```

```bash
cd frontend && npm install && npm run dev
```

- Front: http://localhost:5173 (las llamadas a `/api` se redirigen al backend).
- API: http://localhost:8080/api/salud → `Hola desde BarrioAlerta`.
- Modo demo (reloj congelado a las 10:00, avanza solo cuando se le pide): `npm run demo` en `backend/`.

## Tests

```bash
cd backend && npm test
```

Incluye la **tabla de transiciones del incidente**: cada flecha del diagrama de estados es un caso de test, y cada combinación estado × acción que no está en el diagrama se verifica que sea rechazada.

## Estructura

```
barrioalerta/
├── backend/        Node + Express (aplicación multimódulo)
│   ├── src/
│   │   ├── app.ts           raíz de composición: crea y conecta los objetos (inyección de dependencias)
│   │   ├── compartido/      errores de dominio, reloj, manejo de errores HTTP
│   │   ├── identidad/       usuarios, roles, permisos
│   │   ├── incidentes/      agregado Incidente, estados (State), cuadrillas
│   │   ├── asignacion/      estrategias de asignación de cuadrillas (Strategy); depende de incidentes
│   │   └── demo/            reloj controlable para la demo
│   └── test/
├── frontend/       React + Vite + MUI
├── docs/           justificaciones de diseño y diagramas
├── demo/           guion, checklist, ensayos, seed, script de reset
└── docker-compose.yml
```

Módulos pendientes: `notificaciones/` (Observer, Facade, Adapter: email, SMS y WhatsApp simulados) e `importacion/` (CSV de más de 10.000 filas, Template Method).

## Cómo trabajamos

- `main` siempre demostrable. Cada cambio entra por una rama `feature/<modulo>-<tema>` y un PR con **1 revisión** del par asignado (ver sección 9 del lineamiento).
- Nada se mergea con CI en rojo.
- Si cambia el diseño, el diagrama en `docs/diagramas/` se actualiza **en el mismo PR**.
- **Feature freeze: 29/11/2026.** Después de esa fecha solo se aceptan bugfixes y cambios visuales.

## Estado

| Hito | Estado |
|---|---|
| H0 — Concepción (27/10 – 01/11) | En curso. Hecho: esqueleto del repo, núcleo de estados con tests, diagramas v0. Falta: bocetos |
| H1 — Esqueleto de punta a punta (02/11 – 08/11) | Pendiente |
| H2 — Inteligencia del dominio (09/11 – 15/11) | Pendiente |
| H3 — Eventos, tiempo e integración (16/11 – 22/11) | Pendiente |
| H4 — Pulido y validación (23/11 – 29/11) | Pendiente |
| H5 — Ensayo (30/11 – entrega) | Pendiente |
