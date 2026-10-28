package ar.utn.barrioalerta.incidentes.dominio.eventos;

import ar.utn.barrioalerta.incidentes.dominio.Incidente;
import ar.utn.barrioalerta.incidentes.dominio.Vecino;
import java.time.LocalDateTime;

public record AdhesionRegistrada(Incidente incidente, Vecino vecino, LocalDateTime ocurridoEn)
        implements EventoDominio {
}
