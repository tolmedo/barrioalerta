# Diagrama de clases — Módulo Notificaciones

**Estado:** propuesto (H3, I4). Este módulo depende de Incidentes, porque escucha sus eventos. Incidentes **no** lo conoce: lo verifica la regla `elDominioNoConoceAlModuloDeNotificaciones` de `ArquitecturaTest`.

```mermaid
classDiagram
direction LR

class NotificarInteresadosListener {
  <<listener · AFTER_COMMIT + Async>>
  +alCambiarEstado(EstadoIncidenteCambiado evento)
  +alEscalar(IncidenteEscalado evento)
  +alAdherir(AdhesionRegistrada evento)
}
class ServicioNotificaciones {
  <<Facade>>
  +notificarCambioDeEstado(EstadoIncidenteCambiado evento)
  +notificarEscalamiento(IncidenteEscalado evento)
  -destinatariosDe(Incidente incidente) List~Vecino~
  -enviar(Notificacion notificacion)
}
class Notificacion {
  -Long id
  -Usuario destinatario
  -TipoCanal canal
  -String mensaje
  -LocalDateTime fecha
  -boolean leida
  +marcarLeida()
}
class PlantillaDeMensaje {
  +para(EventoDominio evento) String
}
class CanalNotificacion {
  <<interface>>
  +enviar(Notificacion notificacion)
  +tipo() TipoCanal
}
class CanalInApp {
  +enviar(Notificacion notificacion)
}
class CanalEmailSimulado {
  <<Adapter>>
  +enviar(Notificacion notificacion)
}
class CanalWhatsAppSimulado {
  <<Adapter>>
  +enviar(Notificacion notificacion)
}
class CanalNotificacionFactory {
  <<Simple Factory>>
  +crear(TipoCanal tipo) CanalNotificacion
}
class BandejaDeSimulacion {
  +registrar(TipoCanal canal, Notificacion notificacion)
  +enviadas() List~Notificacion~
}
class RepositorioNotificaciones {
  <<interface>>
  +guardar(Notificacion notificacion)
  +noLeidasDe(Usuario usuario) List~Notificacion~
}

NotificarInteresadosListener --> ServicioNotificaciones
ServicioNotificaciones --> PlantillaDeMensaje
ServicioNotificaciones --> CanalNotificacionFactory
ServicioNotificaciones --> RepositorioNotificaciones
ServicioNotificaciones ..> Notificacion : crea
CanalNotificacionFactory ..> CanalNotificacion : crea
CanalNotificacion <|.. CanalInApp
CanalNotificacion <|.. CanalEmailSimulado
CanalNotificacion <|.. CanalWhatsAppSimulado
CanalEmailSimulado --> BandejaDeSimulacion
CanalWhatsAppSimulado --> BandejaDeSimulacion
```

## Decisiones

- **Observer → Pub/Sub en proceso** (C10). El listener corre después del commit (`@TransactionalEventListener(phase = AFTER_COMMIT)`) y en otro hilo (`@Async`). Si un canal falla, la operación del operador no se revierte (D7).
- **Facade** (C06): `ServicioNotificaciones` es el único punto de entrada. Los listeners no saben de canales ni de plantillas.
- **Adapter** (C06): los canales simulados tienen la misma interfaz que tendría un proveedor real. Para pasar a WhatsApp real alcanza con otra implementación de `CanalNotificacion`.
- **Simple Factory** (C06, mismo ejemplo `NotificadorFactory` de la clase): la elección del canal según la preferencia del vecino está en un solo lugar.
- In-app siempre se envía; además se usa el canal preferido del vecino si es distinto.
