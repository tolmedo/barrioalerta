# Diagrama de clases — Módulo Incidentes (núcleo)

**Estado:** el dominio está implementado en `backend/src/incidentes/dominio`. Las estrategias concretas de priorización y el `DetectorDeDuplicados` son **propuestos** (H2, I2).

Convenciones: `$` = estático, `*` = abstracto. `cambiarEstado` (y otros auxiliares que no se dibujan, como `asignarCuadrilla` o `liberarCuadrilla`) son públicos en TypeScript porque no existe la visibilidad de paquete, pero solo los llaman los estados; se controla en la revisión de cada PR.

```mermaid
classDiagram
direction TB

class Incidente {
  -id: number
  -descripcion: string
  -fechaReporte: Date
  -vencimientoSla: Date
  -nivelEscalamiento: number
  -prioridad: number
  +reportar(tipo, descripcion, ubicacion, reportante, ahora)$ Incidente
  +adherir(vecino: Vecino, ahora: Date)
  +validar(operador: Usuario, ahora: Date)
  +rechazar(operador: Usuario, motivo: string, ahora: Date)
  +marcarDuplicadoDe(original: Incidente, operador: Usuario, ahora: Date)
  +asignar(cuadrilla: Cuadrilla, operador: Usuario, ahora: Date)
  +iniciarTrabajo(miembro: Usuario, ahora: Date)
  +resolver(miembro: Usuario, evidencia: Evidencia, ahora: Date)
  +reabrir(vecino: Vecino, motivo: string, ahora: Date)
  +cerrar(actor: Usuario, ahora: Date)
  +estaVencido(ahora: Date) boolean
  +debeEscalar(ahora: Date) boolean
  +escalar(ahora: Date)
  +actualizarPrioridad(nuevaPrioridad: number)
  +accionesPermitidas() Set~Accion~
  +extraerEventos() EventoDominio[]
  +cambiarEstado(nuevo, actor, motivo, ahora)
}

class EstadoIncidente {
  <<abstract>>
  +nombre: NombreEstado
  +accionesPermitidas() Set~Accion~*
  +admiteAdhesiones() boolean
  +cuentaParaSla() boolean
  +validar(i, operador, ahora)
  +rechazar(i, operador, motivo, ahora)
  +marcarDuplicadoDe(i, original, operador, ahora)
  +asignar(i, cuadrilla, operador, ahora)
  +iniciarTrabajo(i, miembro, ahora)
  +resolver(i, evidencia, miembro, ahora)
  +reabrir(i, vecino, motivo, ahora)
  +cerrar(i, actor, ahora)
  +desdeNombre(nombre: string)$ EstadoIncidente
}
class Reportado {
  +INSTANCIA$
}
class Validado {
  +INSTANCIA$
}
class Asignado {
  +INSTANCIA$
}
class EnCurso {
  +INSTANCIA$
}
class Resuelto {
  +INSTANCIA$
  +DIAS_PARA_REABRIR$
}
class Cerrado {
  +INSTANCIA$
}
class Rechazado {
  +INSTANCIA$
}
class Duplicado {
  +INSTANCIA$
}
EstadoIncidente <|-- Reportado
EstadoIncidente <|-- Validado
EstadoIncidente <|-- Asignado
EstadoIncidente <|-- EnCurso
EstadoIncidente <|-- Resuelto
EstadoIncidente <|-- Cerrado
EstadoIncidente <|-- Rechazado
EstadoIncidente <|-- Duplicado

class Accion {
  <<enumeration>>
  VALIDAR
  RECHAZAR
  MARCAR_DUPLICADO
  ASIGNAR
  INICIAR_TRABAJO
  RESOLVER
  REABRIR
  CERRAR
}

class CambioDeEstado {
  estadoAnterior: NombreEstado
  estadoNuevo: NombreEstado
  actor: Usuario
  fecha: Date
  motivo: string
}
class Adhesion {
  vecino: Vecino
  fecha: Date
}
class Evidencia {
  rutaFoto: string
  nota: string
  autor: Usuario
  fecha: Date
}
class Ubicacion {
  <<value object>>
  latitud: number
  longitud: number
  direccion: string
  barrio: string
  +distanciaMetrosA(otra: Ubicacion) number
}
class TipoIncidente {
  nombre: string
  gravedad: number
  slaHoras: number
  radioDuplicadoMetros: number
}
class Vecino {
  nombre: string
  barrio: string
  -canalPreferido: TipoCanal
  +cambiarCanalPreferido(canal: TipoCanal)
}
class Cuadrilla {
  nombre: string
  +puedeAtender(tipo: TipoIncidente) boolean
  +tieneMiembro(usuario: Usuario) boolean
}
class Usuario {
  <<módulo identidad>>
  username: string
  +tenesPermiso(permiso: Permiso) boolean
  +esSistema() boolean
}

Incidente "*" --> "1" EstadoIncidente : estado
Incidente "1" *-- "0..*" CambioDeEstado : historial
Incidente "1" *-- "0..*" Adhesion : adhesiones
Incidente "1" *-- "0..*" Evidencia : evidencias
Incidente "*" --> "1" TipoIncidente : tipo
Incidente "*" --> "1" Vecino : reportante
Incidente "*" --> "0..1" Cuadrilla : cuadrillaAsignada
Incidente "*" --> "0..1" Incidente : original
Incidente *-- "1" Ubicacion : ubicacion
Cuadrilla *-- "1" Ubicacion : base
Cuadrilla "*" --> "1..*" TipoIncidente : especialidades
Cuadrilla "*" --> "1..*" Usuario : miembros
Vecino "1" --> "1" Usuario : usuario
EstadoIncidente ..> Accion

class EventoDominio {
  <<union de tipos>>
  tipo: string
  incidente: Incidente
  ocurridoEn: Date
}
Incidente ..> EventoDominio : registra

class EstrategiaPriorizacion {
  <<interface>>
  +nombre: string
  +puntuar(incidente: Incidente, contexto: ContextoPriorizacion) number
}
class PriorizacionPonderada {
  <<propuesto H2>>
  -pesoGravedad: number
  -pesoAdhesiones: number
  -pesoAntiguedad: number
  -pesoZonaSensible: number
}
class PriorizacionPorRiesgoSla {
  <<propuesto H2>>
}
class DetectorDeDuplicados {
  <<propuesto H2>>
  +candidatos(tipo, ubicacion, abiertos: Incidente[]) Incidente[]
}
EstrategiaPriorizacion <|.. PriorizacionPonderada
EstrategiaPriorizacion <|.. PriorizacionPorRiesgoSla
DetectorDeDuplicados ..> Incidente
```

Los eventos (`EventoDominio`) son cuatro: `IncidenteReportado`, `EstadoIncidenteCambiado` (con estado anterior, nuevo y actor), `AdhesionRegistrada` (con el vecino) e `IncidenteEscalado` (con el nivel). Se distinguen por el campo `tipo`.

## Decisiones que muestra este diagrama

- **State** (C03): `Incidente` delega en `EstadoIncidente`. La clase abstracta rechaza todas las acciones por defecto y cada estado redefine solo las que admite. Los estados no tienen atributos (instancia única) y se guardan por nombre (`desdeNombre`).
- **Auditoría obligatoria**: `cambiarEstado` es el único método que modifica el estado, y siempre agrega un `CambioDeEstado` con actor.
- **Type Object** en lugar de herencia: `TipoIncidente` es configurable. No hay subclases `Bache`, `Luminaria`, etc.
- **`Cuadrilla` vive en este módulo** porque `Incidente` la referencia. Así el módulo Asignación depende de Incidentes y no al revés.
