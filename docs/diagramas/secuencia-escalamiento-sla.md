# Secuencia 3 — Escalamiento por SLA

**Estado:** propuesto (H3, I7).
- **Ya implementados:** `Incidente.debeEscalar`, `escalar`, `IncidenteEscalado` y `RelojDeDemo.avanzar`.

```mermaid
sequenceDiagram
  autonumber
  actor A as Admin (panel de demo)
  participant DC as DemoController
  participant RD as RelojDeDemo
  participant J as ControlDeSlaJob
  participant R as RepositorioIncidentes
  participant I as incidente:Incidente
  participant P as ApplicationEventPublisher

  A->>DC: PUT /api/demo/reloj {avanzarHoras: 48}
  DC->>RD: avanzar(48 h)
  DC->>J: ejecutar()
  Note over J: fuera de la demo, el mismo método<br/>lo dispara @Scheduled(fixedDelay)
  J->>RD: instant()
  RD-->>J: ahora
  J->>R: abiertosConVencimientoAntesDe(ahora)
  R-->>J: candidatos
  loop por cada candidato
    J->>I: debeEscalar(ahora)
    I-->>J: true
    J->>I: escalar(ahora)
    I->>I: nivelEscalamiento++ y registra IncidenteEscalado
    J->>R: guardar(incidente)
    J->>I: extraerEventos()
    I-->>J: [IncidenteEscalado]
    J->>P: publishEvent(IncidenteEscalado)
  end
  DC-->>A: 200 {hora, escalados: 1}
```

**Por qué es determinístico:** el job no pregunta la hora al sistema operativo, sino al `Clock` inyectado. En la demo ese reloj está congelado y solo avanza cuando el admin lo pide (D10).
