# Diagrama de clases — Módulo Asignación

**Estado:**
- **Implementado** (en `asignacion/dominio`): `EstrategiaAsignacion`, `PropuestaAsignacion` y `ContextoAsignacion`.
- **Propuesto** (H2, I3): las estrategias concretas y el servicio.

```mermaid
classDiagram
direction LR

class EstrategiaAsignacion {
  <<interface>>
  +proponer(Incidente incidente, List~Cuadrilla~ cuadrillas, ContextoAsignacion contexto) List~PropuestaAsignacion~
  +nombre() String
}
class AsignacionPorCercania {
  <<propuesto H2>>
  +proponer(Incidente incidente, List~Cuadrilla~ cuadrillas, ContextoAsignacion contexto) List~PropuestaAsignacion~
}
class AsignacionPorMenorCarga {
  <<propuesto H2>>
  +proponer(Incidente incidente, List~Cuadrilla~ cuadrillas, ContextoAsignacion contexto) List~PropuestaAsignacion~
}
class PropuestaAsignacion {
  <<record>>
  Cuadrilla cuadrilla
  double score
  String justificacion
}
class ContextoAsignacion {
  <<record>>
  Map~Cuadrilla, Integer~ incidentesActivosPorCuadrilla
  +cargaDe(Cuadrilla cuadrilla) int
}
class RegistroDeEstrategias {
  <<propuesto H2 · Simple Factory>>
  +obtener(String nombre) EstrategiaAsignacion
  +disponibles() List~String~
}
class PropuestasDeAsignacionService {
  <<propuesto H2 · servicio de aplicación>>
  +proponer(Long incidenteId, String nombreEstrategia) List~PropuestaAsignacion~
}
class Incidente {
  <<módulo incidentes>>
}
class Cuadrilla {
  <<módulo incidentes>>
}

EstrategiaAsignacion <|.. AsignacionPorCercania
EstrategiaAsignacion <|.. AsignacionPorMenorCarga
EstrategiaAsignacion ..> PropuestaAsignacion : crea
EstrategiaAsignacion ..> ContextoAsignacion
EstrategiaAsignacion ..> Incidente
PropuestaAsignacion --> Cuadrilla
RegistroDeEstrategias o-- "2..*" EstrategiaAsignacion
PropuestasDeAsignacionService --> RegistroDeEstrategias
```

## Reglas para las implementaciones (H2)

- **Solo** se proponen cuadrillas con `cuadrilla.puedeAtender(incidente.tipo())`.
- Se devuelven como máximo 3 propuestas, ordenadas por `score` descendente, con `score` en [0, 1] y una `justificacion` legible (por ejemplo, "A 420 m de la base").
- `AsignacionPorCercania`: `score = 1 − min(distancia / 5000 m, 1)` usando `Ubicacion.distanciaMetrosA`.
- `AsignacionPorMenorCarga`: `score = 1 / (1 + carga)` con `contexto.cargaDe(cuadrilla)`.
- Las estrategias se registran como beans de Spring y `RegistroDeEstrategias` las indexa por `nombre()`. Agregar una nueva no modifica clases existentes (OCP, RNF8).
- **State ≠ Strategy:** el incidente no elige su estrategia. La elige el operador en la UI.
