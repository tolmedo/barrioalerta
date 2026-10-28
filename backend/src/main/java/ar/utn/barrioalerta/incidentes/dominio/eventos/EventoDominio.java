package ar.utn.barrioalerta.incidentes.dominio.eventos;

import ar.utn.barrioalerta.incidentes.dominio.Incidente;
import java.time.LocalDateTime;

/**
 * Algo relevante que le pasó a un incidente. El agregado los acumula y el servicio de aplicación
 * los publica después de guardar (Observer → Pub/Sub en proceso, C10). Así el dominio no conoce a
 * quienes reaccionan (notificaciones, recálculo de prioridad, métricas).
 * <p>
 * Se referencia al incidente (y no solo a su id) porque los eventos se crean antes de persistir,
 * cuando el id todavía no existe.
 */
public sealed interface EventoDominio
        permits IncidenteReportado, EstadoIncidenteCambiado, AdhesionRegistrada, IncidenteEscalado {

    Incidente incidente();

    LocalDateTime ocurridoEn();
}
