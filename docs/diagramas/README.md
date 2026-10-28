# Diagramas

Son los que pide el enunciado del TP Anual (entregas 1 a 4). **Si cambia el código, el diagrama se actualiza en el mismo PR** (C13: "diagramas lindos pero inconsistentes entre sí").

Estado de cada diagrama:
- **Implementado:** el código del repo coincide con el diagrama (nombres de clases y métodos).
- **Propuesto:** es diseño hacia adelante y todavía no hay código.

| Diagrama | Archivo | Estado |
|---|---|---|
| Casos de uso | [casos-de-uso.puml](casos-de-uso.puml) | Propuesto v0 |
| Clases — Incidentes | [clases-incidentes.md](clases-incidentes.md) | **Implementado** |
| Clases — Asignación | [clases-asignacion.md](clases-asignacion.md) | Interfaces implementadas; concretas propuestas |
| Clases — Notificaciones | [clases-notificaciones.md](clases-notificaciones.md) | Propuesto |
| Estados del incidente | [estados-incidente.md](estados-incidente.md) | **Implementado** y testeado |
| Componentes | [componentes.puml](componentes.puml) | Propuesto v0 |
| Despliegue | [despliegue.puml](despliegue.puml) | Propuesto v0 |
| DER físico | [der.md](der.md) | Propuesto v0 |

El diagrama de clases de Importación (Template Method) se agrega en H3, junto con el código. Las justificaciones de diseño están en [justificaciones.md](justificaciones.md).

## Cómo verlos

- **Mermaid:** GitHub y VS Code (con la extensión *Markdown Preview Mermaid Support*) los renderizan solos.
- **PlantUML:** extensión *PlantUML* de VS Code, o pegando el código en https://www.plantuml.com/plantuml.
