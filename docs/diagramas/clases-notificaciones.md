# Diagrama de clases — Módulo Notificaciones

**Estado:** propuesto. Este módulo depende de Incidentes, porque escucha sus eventos. Incidentes **no** lo conoce.

```mermaid
classDiagram
direction LR

class NotificarInteresadosListener {
  <<suscriptor de eventos>>
  +alCambiarEstado(evento: EstadoIncidenteCambiado)
  +alEscalar(evento: IncidenteEscalado)
  +alAdherir(evento: AdhesionRegistrada)
}
class ServicioNotificaciones {
  <<Facade>>
  +notificarCambioDeEstado(evento: EstadoIncidenteCambiado)
  +notificarEscalamiento(evento: IncidenteEscalado)
  -destinatariosDe(incidente: Incidente) Vecino[]
  -enviar(notificacion: Notificacion)
}
class Notificacion {
  -id: number
  -destinatario: Usuario
  -canal: TipoCanal
  -mensaje: string
  -fecha: Date
  -leida: boolean
  +marcarLeida()
}
class PlantillaDeMensaje {
  +para(evento: EventoDominio) string
}
class CanalNotificacion {
  <<interface>>
  +tipo: TipoCanal
  +enviar(notificacion: Notificacion)
}
class CanalInApp {
  +enviar(notificacion: Notificacion)
}
class CanalEmailSimulado {
  <<Adapter>>
  +enviar(notificacion: Notificacion)
}
class CanalSmsSimulado {
  <<Adapter>>
  +enviar(notificacion: Notificacion)
}
class CanalWhatsAppSimulado {
  <<Adapter>>
  +enviar(notificacion: Notificacion)
}
class CanalNotificacionFactory {
  <<Simple Factory>>
  +crear(tipo: TipoCanal) CanalNotificacion
}
class BandejaDeSimulacion {
  +registrar(canal: TipoCanal, notificacion: Notificacion)
  +enviadas() Notificacion[]
}
class RepositorioNotificaciones {
  <<interface · Mongoose/MongoDB>>
  +guardar(notificacion: Notificacion)
  +noLeidasDe(usuario: Usuario) Notificacion[]
}

NotificarInteresadosListener --> ServicioNotificaciones
ServicioNotificaciones --> PlantillaDeMensaje
ServicioNotificaciones --> CanalNotificacionFactory
ServicioNotificaciones --> RepositorioNotificaciones
ServicioNotificaciones ..> Notificacion : crea
CanalNotificacionFactory ..> CanalNotificacion : crea
CanalNotificacion <|.. CanalInApp
CanalNotificacion <|.. CanalEmailSimulado
CanalNotificacion <|.. CanalSmsSimulado
CanalNotificacion <|.. CanalWhatsAppSimulado
CanalEmailSimulado --> BandejaDeSimulacion
CanalSmsSimulado --> BandejaDeSimulacion
CanalWhatsAppSimulado --> BandejaDeSimulacion
```

## Decisiones

- **Observer → suscripción a eventos**. El servicio de aplicación publica los eventos recién después de guardar el incidente, y el envío no bloquea la respuesta. Si un canal falla, la operación del operador no se revierte.
- **Facade**: `ServicioNotificaciones` es el único punto de entrada. Los listeners no saben de canales ni de plantillas.
- **Adapter**: los canales simulados tienen la misma interfaz que tendría un proveedor real. Para pasar a WhatsApp real alcanza con otra implementación de `CanalNotificacion`.
- **Simple Factory**: la elección del canal según la preferencia del vecino está en un solo lugar.
- **Persistencia en MongoDB**: `RepositorioNotificaciones` se implementa con Mongoose. El documento está en [der.md](der.md).
- In-app siempre se envía; además se usa el canal preferido del vecino si es distinto.
