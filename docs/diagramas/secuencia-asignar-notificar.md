# Secuencia 2 — Asignar cuadrilla y notificar

**Estado:** propuesto (H2–H3, I3 + I4).
- **Ya implementados:** `Incidente.asignar`, `Validado.asignar`, `asignarCuadrilla`, `cambiarEstado`, `extraerEventos` y `EstadoIncidenteCambiado`.

```mermaid
sequenceDiagram
  autonumber
  actor O as Operadora Carla (SPA)
  participant C as IncidentesController
  participant PS as PropuestasDeAsignacionService
  participant RE as RegistroDeEstrategias
  participant E as estrategia:EstrategiaAsignacion
  participant S as GestionIncidentesService
  participant I as incidente:Incidente
  participant ST as estado:Validado
  participant R as RepositorioIncidentes
  participant P as ApplicationEventPublisher
  participant L as NotificarInteresadosListener
  participant N as ServicioNotificaciones
  participant F as CanalNotificacionFactory
  participant CN as canal:CanalNotificacion

  O->>C: GET /api/incidentes/102/propuestas-asignacion?estrategia=CERCANIA
  C->>PS: proponer(102, "CERCANIA")
  PS->>RE: obtener("CERCANIA")
  RE-->>PS: estrategia
  PS->>E: proponer(incidente, cuadrillas, contexto)
  E-->>PS: [Norte 0.92, Sur 0.40]
  PS-->>C: propuestas
  C-->>O: 200 propuestas (se repite con MENOR_CARGA para la otra columna)

  O->>C: PUT /api/incidentes/102/asignacion {cuadrillaId}
  C->>S: asignar(102, cuadrillaId, operadora)
  S->>I: asignar(cuadrilla, operadora, ahora)
  I->>I: verifica cuadrilla.puedeAtender(tipo)
  I->>ST: asignar(incidente, cuadrilla, operadora, ahora)
  ST->>I: asignarCuadrilla(cuadrilla)
  ST->>I: cambiarEstado(Asignado, operadora, "Asignado a Norte", ahora)
  I->>I: agrega CambioDeEstado y EstadoIncidenteCambiado
  S->>R: guardar(incidente)
  S->>I: extraerEventos()
  I-->>S: [EstadoIncidenteCambiado]
  S->>P: publishEvent(EstadoIncidenteCambiado)
  C-->>O: 200 OK (la tarjeta pasa a "Asignado")

  Note over P,L: después del COMMIT, en otro hilo (@Async)
  P-)L: alCambiarEstado(evento)
  L->>N: notificarCambioDeEstado(evento)
  loop por cada interesado (reportante y adherentes)
    N->>F: crear(vecino.canalPreferido())
    F-->>N: canal
    N->>CN: enviar(notificacion)
  end
```

Se ven dos ideas en el mismo flujo:
- **Strategy:** la operadora elige el algoritmo.
- **State:** el estado `Validado` decide la transición.

Y la notificación **no** bloquea ni revierte la asignación (D7).
