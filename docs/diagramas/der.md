# DER físico (PostgreSQL) — propuesta v0

**Estado:** propuesto (H1, I7 + I1). Se materializa con migraciones Flyway en `backend/src/main/resources/db/migration`.

```mermaid
erDiagram
  ROL ||--o{ USUARIO : tiene
  ROL ||--o{ ROL_PERMISO : otorga
  USUARIO ||--o| VECINO : "es"
  USUARIO ||--o{ CUADRILLA_MIEMBRO : integra
  CUADRILLA ||--|{ CUADRILLA_MIEMBRO : tiene
  CUADRILLA ||--|{ CUADRILLA_ESPECIALIDAD : atiende
  TIPO_INCIDENTE ||--o{ CUADRILLA_ESPECIALIDAD : "es atendido por"
  TIPO_INCIDENTE ||--o{ INCIDENTE : clasifica
  VECINO ||--o{ INCIDENTE : reporta
  CUADRILLA |o--o{ INCIDENTE : "tiene asignados"
  INCIDENTE |o--o{ INCIDENTE : "es original de"
  INCIDENTE ||--|{ CAMBIO_DE_ESTADO : historial
  USUARIO ||--o{ CAMBIO_DE_ESTADO : "es actor de"
  INCIDENTE ||--o{ ADHESION : recibe
  VECINO ||--o{ ADHESION : realiza
  INCIDENTE ||--o{ EVIDENCIA : tiene
  USUARIO ||--o{ NOTIFICACION : recibe

  ROL {
    bigint id PK
    varchar nombre UK
  }
  ROL_PERMISO {
    bigint rol_id PK, FK
    varchar permiso PK "enum Permiso"
  }
  USUARIO {
    bigint id PK
    varchar username UK
    varchar password_hash "BCrypt"
    bigint rol_id FK
  }
  VECINO {
    bigint id PK
    bigint usuario_id FK, UK
    varchar nombre
    varchar barrio
    varchar canal_preferido "enum TipoCanal"
  }
  TIPO_INCIDENTE {
    bigint id PK
    varchar nombre UK
    numeric gravedad "0..1"
    int sla_horas
    int radio_duplicado_metros
  }
  CUADRILLA {
    bigint id PK
    varchar nombre UK
    double base_latitud
    double base_longitud
    varchar base_direccion
    varchar base_barrio
  }
  CUADRILLA_MIEMBRO {
    bigint cuadrilla_id PK, FK
    bigint usuario_id PK, FK
  }
  CUADRILLA_ESPECIALIDAD {
    bigint cuadrilla_id PK, FK
    bigint tipo_incidente_id PK, FK
  }
  INCIDENTE {
    bigint id PK
    bigint tipo_incidente_id FK
    bigint reportante_id FK
    bigint cuadrilla_asignada_id FK "nullable"
    bigint original_id FK "nullable"
    text descripcion
    double latitud "Ubicacion embebida"
    double longitud
    varchar direccion
    varchar barrio
    timestamp fecha_reporte
    timestamp vencimiento_sla
    varchar estado "DESNORMALIZADO: nombre del estado actual"
    int nivel_escalamiento
    numeric prioridad "DESNORMALIZADO: cache del ranking"
    int cantidad_adhesiones "DESNORMALIZADO: contador"
  }
  CAMBIO_DE_ESTADO {
    bigint id PK
    bigint incidente_id FK
    varchar estado_anterior "nullable en el alta"
    varchar estado_nuevo
    bigint actor_id FK
    timestamp fecha
    text motivo
    int orden
  }
  ADHESION {
    bigint incidente_id PK, FK
    bigint vecino_id PK, FK
    timestamp fecha
  }
  EVIDENCIA {
    bigint id PK
    bigint incidente_id FK
    varchar ruta_foto
    text nota
    bigint autor_id FK
    timestamp fecha
  }
  NOTIFICACION {
    bigint id PK
    bigint destinatario_id FK
    varchar canal "enum TipoCanal"
    text mensaje
    timestamp fecha
    boolean leida
  }
```

## Decisiones de mapeo (apunte ORM)

| Decisión | Justificación |
|---|---|
| `estado` como `varchar` con `AttributeConverter<EstadoIncidente, String>` usando `EstadoIncidente.desdeNombre` | Los estados son stateless: se persiste su nombre (apunte ORM, "mapeo de interfaces"). |
| `Ubicacion` embebida (`@Embeddable`) en `INCIDENTE` y `CUADRILLA` | Es un Value Object sin identidad. |
| `ADHESION` con PK compuesta (incidente, vecino) | La base garantiza la regla "nadie adhiere dos veces", además del dominio (validación en profundidad, C04). |
| `estado`, `prioridad` y `cantidad_adhesiones` **desnormalizados** | El mapa y el ranking se leen mucho más de lo que se escriben. El agregado mantiene la consistencia en el mismo método que modifica. |
| Índices: `incidente(estado)`, `incidente(latitud, longitud)`, `incidente(tipo_incidente_id, estado)`, `cambio_de_estado(incidente_id, orden)` | Consultas del mapa por caja delimitadora, de duplicados y del historial ordenado (RNF1). |
| `CAMBIO_DE_ESTADO.orden` | Conserva el orden de la lista `historial` (pendiente del apunte ORM: "persistencia en orden de los elementos de una lista"). |
| Sin herencia en tablas | `TipoIncidente` es un Type Object; no hay jerarquía que mapear. |
