package ar.utn.barrioalerta.incidentes.dominio.eventos;

import ar.utn.barrioalerta.incidentes.dominio.Incidente;
import java.time.LocalDateTime;

public record IncidenteReportado(Incidente incidente, LocalDateTime ocurridoEn) implements EventoDominio {
}
