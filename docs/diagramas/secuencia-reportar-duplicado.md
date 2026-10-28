# Secuencia 1 — Reportar con duplicado (el vecino se suma)

**Estado:** propuesto (H2, I2).
- **Ya implementados** (los mensajes coinciden con el código): `Incidente.adherir`, `extraerEventos` y `AdhesionRegistrada`.
- **A crear:** servicios, repositorios y controller, con estos nombres.

```mermaid
sequenceDiagram
  autonumber
  actor V as Vecina Ana (SPA)
  participant C as IncidentesController
  participant S as GestionIncidentesService
  participant R as RepositorioIncidentes
  participant D as DetectorDeDuplicados
  participant RV as RepositorioVecinos
  participant I as incidente:Incidente
  participant P as ApplicationEventPublisher

  V->>C: GET /api/incidentes/duplicados-candidatos?tipo=Bache&lat=..&lon=..
  C->>S: buscarDuplicados(tipo, latitud, longitud)
  S->>R: abiertosCerca(tipo, cajaDelimitadora)
  R-->>S: abiertos
  S->>D: candidatos(tipo, ubicacion, abiertos)
  D-->>S: [#101 a 15 m]
  S-->>C: candidatos
  C-->>V: 200 [#101]
  Note over V: "¿Es alguno de estos?" → elige "Sumarme"

  V->>C: POST /api/incidentes/101/adhesiones
  C->>S: adherir(101, usuarioAutenticado)
  S->>R: buscar(101)
  R-->>S: incidente
  S->>RV: buscarPorUsuario(usuarioAutenticado)
  RV-->>S: vecino
  S->>I: adherir(vecino, ahora)
  Note right of I: verifica estado.admiteAdhesiones(),<br/>que no sea el reportante<br/>y que no haya adherido antes
  I->>I: registra AdhesionRegistrada
  S->>R: guardar(incidente)
  S->>I: extraerEventos()
  I-->>S: [AdhesionRegistrada]
  S->>P: publishEvent(AdhesionRegistrada)
  S-->>C: incidente
  C-->>V: 201 Created
```

`ahora` sale del `Clock` inyectado en el servicio (D10). Si `adherir` lanza `ReglaDeNegocioException`, el `ManejadorDeErrores` responde 422 y no se publica nada.
