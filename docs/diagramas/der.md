# Modelo de datos físico — propuesta v0

**Estado:** propuesto (H1, I7 + I1). Persistencia políglota, como pide la E4: todo en PostgreSQL con ORM, salvo Notificaciones, que va en MongoDB con ODM (al final de este archivo).

## PostgreSQL

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
    int sla_horas
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
```

## Decisiones de mapeo (apunte ORM)

| Decisión | Justificación |
|---|---|
| `estado` como `varchar`; al leer se reconstruye con `EstadoIncidente.desdeNombre` | Los estados son stateless: se persiste su nombre (apunte ORM, "mapeo de interfaces"). |
| `Ubicacion` embebida (columnas `latitud`, `longitud`, `direccion`, `barrio`) en `INCIDENTE` y `CUADRILLA` | Es un Value Object sin identidad. |
| `ADHESION` con PK compuesta (incidente, vecino) | La base garantiza la regla "nadie adhiere dos veces", además del dominio (validación en profundidad, C04). |
| `estado` y `cantidad_adhesiones` **desnormalizados** | El mapa y la bandeja se leen mucho más de lo que se escriben. El agregado mantiene la consistencia en el mismo método que modifica. |
| Índices: `incidente(estado)`, `incidente(latitud, longitud)`, `incidente(tipo_incidente_id, estado)`, `cambio_de_estado(incidente_id, orden)` | Consultas del mapa por caja delimitadora, de la bandeja por tipo y estado, y del historial ordenado. |
| `CAMBIO_DE_ESTADO.orden` | Conserva el orden de la lista `historial` (pendiente del apunte ORM: "persistencia en orden de los elementos de una lista"). |
| Sin herencia en tablas | `TipoIncidente` es un Type Object; no hay jerarquía que mapear. |

## MongoDB — colección `notificaciones` (módulo Notificaciones)

Un documento por notificación enviada. Se guarda con Mongoose (ODM).

```json
{
  "_id": "ObjectId",
  "destinatario": { "username": "vecina.ana", "nombre": "Ana" },
  "canal": "WHATSAPP",
  "mensaje": "Tu reclamo #101 fue asignado a la cuadrilla Norte",
  "incidente": { "id": 101, "tipo": "Bache", "estado": "ASIGNADO" },
  "evento": "EstadoIncidenteCambiado",
  "fecha": "2026-12-07T13:05:00Z",
  "leida": false
}
```

| Decisión | Justificación |
|---|---|
| Base documental para Notificaciones (pregunta de discusión de la E4) | Cada notificación es un registro independiente que solo se agrega y se lee por destinatario; no participa de relaciones que haya que mantener íntegras. |
| Destinatario e incidente **copiados** dentro del documento (no referencias) | La campana muestra la notificación sin consultar PostgreSQL. Es una foto del momento del envío: si el incidente cambia después, la notificación no debe cambiar. |
| Índice `{ "destinatario.username": 1, "leida": 1, "fecha": -1 }` | Consulta de la campana: no leídas de un usuario, las más nuevas primero. |
| Sin claves foráneas hacia PostgreSQL | Es el costo de separar bases: la consistencia la cuida el servicio de aplicación, que crea la notificación a partir del evento. |
