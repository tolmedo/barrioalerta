# Diagramas

Fuente de verdad del diseño. **Si cambia el código, el diagrama se actualiza en el mismo PR** (C13: "diagramas lindos pero inconsistentes entre sí").

Estado de cada diagrama:
- **Implementado:** el código del repo coincide con el diagrama (nombres de clases y métodos).
- **Propuesto:** es diseño hacia adelante y todavía no hay código.

| Diagrama | Archivo | Herramienta | Dueño | Estado |
|---|---|---|---|---|
| Casos de uso | [casos-de-uso.puml](casos-de-uso.puml) | PlantUML | I6 | Propuesto v0 |
| Estados del incidente | [estados-incidente.md](estados-incidente.md) | Mermaid | I1 | **Implementado** (y testeado: `TablaDeTransicionesTest`) |
| Clases — Incidentes (núcleo) | [clases-incidentes.md](clases-incidentes.md) | Mermaid | I1 + I2 | **Implementado** (dominio); estrategias concretas propuestas |
| Clases — Asignación | [clases-asignacion.md](clases-asignacion.md) | Mermaid | I3 | Interfaces implementadas; concretas propuestas |
| Clases — Notificaciones | [clases-notificaciones.md](clases-notificaciones.md) | Mermaid | I4 | Propuesto |
| Clases — Identidad, Importación y Geo | [clases-identidad-importacion-geo.md](clases-identidad-importacion-geo.md) | Mermaid | I7 | Identidad implementada; resto propuesto |
| Secuencia 1 — Reportar con duplicado | [secuencia-reportar-duplicado.md](secuencia-reportar-duplicado.md) | Mermaid | I2 | Propuesto |
| Secuencia 2 — Asignar y notificar | [secuencia-asignar-notificar.md](secuencia-asignar-notificar.md) | Mermaid | I3 + I4 | Propuesto |
| Secuencia 3 — Escalamiento por SLA | [secuencia-escalamiento-sla.md](secuencia-escalamiento-sla.md) | Mermaid | I7 | Propuesto |
| Componentes | [componentes.puml](componentes.puml) | PlantUML | I7 | Propuesto v0 |
| Despliegue (actual y objetivo) | [despliegue.puml](despliegue.puml) | PlantUML | I7 | Propuesto v0 |
| DER físico | [der.md](der.md) | Mermaid | I7 + I1 | Propuesto v0 |
| BPMN "Gestión de un reclamo" | pendiente (`bpmn-reclamo.bpmn`) | bpmn.io / draw.io | I1 | Pendiente H0 |

La vista de contexto y la de contenedores (C4 niveles 1 y 2) están en [../arquitectura.md](../arquitectura.md).

## Cómo verlos

- **Mermaid:** GitHub y VS Code (con la extensión *Markdown Preview Mermaid Support*) los renderizan solos.
- **PlantUML:** extensión *PlantUML* de VS Code. Necesita Java; también funciona con Docker:

```bash
docker run --rm -v "$PWD:/data" plantuml/plantuml -tsvg -o render /data/*.puml
```
