# BarrioAlerta

Plataforma para gestionar reclamos de la vía pública (baches, luminarias, basurales, árboles caídos).
Un vecino reporta con foto y ubicación, el municipio prioriza y asigna a una cuadrilla, y el vecino sigue el avance en un mapa.

TP integrador de **Diseño de Sistemas de Información** — UTN FRBA, 2026.
El lineamiento completo del trabajo está en [`../LINEAMIENTO_TP_DSI.md`](../LINEAMIENTO_TP_DSI.md).

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Java 21 · Spring Boot 3.5 · Spring Data JPA · Flyway · PostgreSQL 16 |
| Frontend | React · TypeScript · Vite · MUI (Material Design) · react-leaflet |
| Tests | JUnit 5 · AssertJ · Mockito · ArchUnit · (Playwright, k6 en H4) |
| Infra local | Docker Compose (solo la base de datos) |

## Requisitos

- **JDK 21 o superior** (recomendado: Eclipse Temurin 21). El código compila con `--release 21`; también funciona con JDK 25. No hace falta instalar Maven: se usa `./mvnw`.
- **Node.js 22** (o ≥ 20.19).
- **PostgreSQL 16**: con Docker Desktop (`docker compose up -d`) o instalado nativo, con base, usuario y contraseña `barrioalerta`.

### Problemas conocidos en Windows

- **Docker Desktop necesita WSL 2**, es decir, la "Plataforma de máquina virtual" habilitada y la virtualización activa en el BIOS. Si `wsl --status` dice que WSL 2 no es compatible, hay dos caminos:
  - habilitarlo (requiere permisos de administrador y reiniciar);
  - instalar PostgreSQL nativo.
- **"Unable to establish loopback connection" al arrancar:** en algunas máquinas Java no puede crear su socket interno de NIO en la carpeta Temp del usuario.
  - `./mvnw test` y `./mvnw spring-boot:run` ya lo resuelven solos, configurado en el `pom.xml`.
  - Si se ejecuta el jar a mano, agregar el flag:

```bash
java -Djdk.net.unixdomain.tmpdir=target -jar target/barrioalerta-0.1.0-SNAPSHOT.jar
```

## Cómo levantarlo

```bash
docker compose up -d
```

```bash
cd backend && ./mvnw spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

- Front: http://localhost:5173 (las llamadas a `/api` se redirigen al backend).
- API: http://localhost:8080/api/salud → `Hola desde BarrioAlerta`.
- Salud técnica: http://localhost:8080/actuator/health

En Windows sin Git Bash, usar `mvnw.cmd` en lugar de `./mvnw`.

## Tests

```bash
cd backend && ./mvnw verify
```

Incluye la **tabla de transiciones del incidente** (cada fila del diagrama de estados es un caso de test) y las **reglas de arquitectura** (ArchUnit): el dominio no depende de Spring y los módulos no tienen ciclos.

## Estructura

```
barrioalerta/
├── backend/        Spring Boot (monolito modular)
│   └── src/main/java/ar/utn/barrioalerta/
│       ├── compartido/      configuración y manejo de errores transversal
│       ├── identidad/       usuarios, roles, permisos (JWT en H1)
│       ├── incidentes/      agregado Incidente, estados (State), cuadrillas, priorización
│       ├── asignacion/      estrategias de asignación de cuadrillas (Strategy); depende de incidentes
│       ├── notificaciones/  eventos → notificaciones (Observer, Facade, Adapter)
│       ├── importacion/     importación CSV (Template Method)
│       ├── geo/             adaptadores de geocodificación (Georef / offline)
│       └── demo/            reloj controlable y reset (@Profile("demo"))
├── frontend/       React + Vite + MUI
├── docs/           arquitectura, diagramas (Mermaid / PlantUML), UX, validación
├── demo/           guion, checklist, ensayos, seed, scripts de reset
├── e2e/            Playwright (guion automatizado, H4)
└── docker-compose.yml
```

## Cómo trabajamos

- `main` siempre demostrable. Cada cambio entra por una rama `feature/<modulo>-<tema>` y un PR con **1 revisión** del par asignado (ver sección 9 del lineamiento).
- Nada se mergea con CI en rojo.
- Si cambia el diseño, el diagrama en `docs/diagramas/` se actualiza **en el mismo PR** (coherencia clases ↔ secuencia ↔ código).
- **Feature freeze: 29/11/2026.** Después de esa fecha solo se aceptan bugfixes y cambios visuales.

## Estado

| Hito | Estado |
|---|---|
| H0 — Concepción (27/10 – 01/11) | En curso. Hecho: esqueleto del repo, núcleo de estados con 111 tests verdes, diagramas v0. Falta: BPMN y bocetos |
| H1 — Esqueleto E2E (02/11 – 08/11) | Pendiente |
| H2 — Inteligencia del dominio (09/11 – 15/11) | Pendiente |
| H3 — Eventos, tiempo e integración (16/11 – 22/11) | Pendiente |
| H4 — Pulido y validación (23/11 – 29/11) | Pendiente |
| H5 — Ensayo (30/11 – entrega) | Pendiente |
