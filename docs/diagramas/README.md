# Diagramas

Son los que pide el enunciado del TP Anual (entregas 1 a 4). **Si cambia el código, el diagrama se actualiza en el mismo PR** (C13: "diagramas lindos pero inconsistentes entre sí").

Estado de cada diagrama:
- **Implementado:** el código del repo coincide con el diagrama (nombres de clases y métodos).
- **Propuesto:** es diseño hacia adelante y todavía no hay código.

| Diagrama | Lo pide | Archivo | Dueño | Estado |
|---|---|---|---|---|
| Casos de uso (general) | E1 | [casos-de-uso.puml](casos-de-uso.puml) | I6 | Propuesto v0 |
| Clases — Incidentes (núcleo) | E1–E4, "por servicio" | [clases-incidentes.md](clases-incidentes.md) | I1 | **Implementado** |
| Clases — Asignación | E1–E4 | [clases-asignacion.md](clases-asignacion.md) | I3 | Interfaces implementadas; concretas propuestas |
| Clases — Notificaciones | E1–E4 | [clases-notificaciones.md](clases-notificaciones.md) | I4 | Propuesto |
| Estados del incidente | E2 (figura del ciclo de vida) | [estados-incidente.md](estados-incidente.md) | I1 | **Implementado** y testeado (`tablaDeTransiciones.test.ts`) |
| Componentes | E1, E2 | [componentes.puml](componentes.puml) | I7 | Propuesto v0 |
| Despliegue | E1, E2, E3, E6 | [despliegue.puml](despliegue.puml) | I7 | Propuesto v0 |
| DER físico | E4 | [der.md](der.md) | I7 + I1 | Propuesto v0 |

El diagrama de clases de Importación (Template Method) se agrega en H3, junto con el código. Las justificaciones de diseño están en [../justificaciones.md](../justificaciones.md).

## Cómo verlos

- **Mermaid:** GitHub y VS Code (con la extensión *Markdown Preview Mermaid Support*) los renderizan solos.
- **PlantUML:** extensión *PlantUML* de VS Code (necesita Java instalado), o pegando el código en https://www.plantuml.com/plantuml.
