package ar.utn.barrioalerta.incidentes.dominio.eventos;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import ar.utn.barrioalerta.incidentes.dominio.Incidente;
import java.time.LocalDateTime;

public record EstadoIncidenteCambiado(Incidente incidente, String estadoAnterior, String estadoNuevo,
                                      Usuario actor, LocalDateTime ocurridoEn) implements EventoDominio {
}
