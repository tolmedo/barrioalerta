package ar.utn.barrioalerta.incidentes.dominio.eventos;

import ar.utn.barrioalerta.incidentes.dominio.Incidente;
import java.time.LocalDateTime;

public record IncidenteEscalado(Incidente incidente, int nivel, LocalDateTime ocurridoEn) implements EventoDominio {
}
