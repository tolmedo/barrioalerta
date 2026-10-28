# Diagrama de estados — Incidente

**Estado:** implementado. Cada flecha es una fila de `TRANSICIONES` en
`backend/test/incidentes/tablaDeTransiciones.test.ts`. Cualquier combinación estado × acción que no aparezca acá lanza `TransicionInvalidaError` (HTTP 409).

```mermaid
stateDiagram-v2
  [*] --> Reportado : reportar() [vecino]

  Reportado --> Validado : validar() [operador]
  Reportado --> Rechazado : rechazar(motivo) [operador, motivo obligatorio]
  Reportado --> Duplicado : marcarDuplicadoDe(original) [operador, mismo tipo]

  Validado --> Asignado : asignar(cuadrilla) [operador, cuadrilla con la especialidad]
  Asignado --> Asignado : asignar(otraCuadrilla) / reasignación [operador]
  Asignado --> EnCurso : iniciarTrabajo() [miembro de la cuadrilla asignada]

  EnCurso --> Resuelto : resolver(evidencia) [miembro de la cuadrilla, foto obligatoria]

  Resuelto --> Cerrado : cerrar() [vecino reportante]
  Resuelto --> Validado : reabrir(motivo) [vecino reportante, dentro de 7 días]

  Rechazado --> [*]
  Duplicado --> [*]
  Cerrado --> [*]

  note right of Asignado
    El SLA vencido NO es un estado:
    incrementa nivelEscalamiento y emite
    IncidenteEscalado (en Validado,
    Asignado y EnCurso).
  end note
  note left of Reportado
    Admiten adhesiones: Reportado,
    Validado, Asignado y EnCurso.
  end note
```

## Reglas que no son transiciones

| Regla | Dónde vive |
|---|---|
| Toda transición registra `CambioDeEstado(anterior, nuevo, actor, fecha, motivo)` y emite `EstadoIncidenteCambiado` | `Incidente.cambiarEstado` (único punto de cambio) |
| Reabrir libera la cuadrilla asignada | `Resuelto.reabrir` |
| El SLA vence a las `slaHoras` del reporte; escala como máximo una vez por período de SLA | `Incidente.estaVencido`, `debeEscalar`, `escalar` |
