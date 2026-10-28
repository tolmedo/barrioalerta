package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entrada de auditoría: quién, qué, cuándo y por qué (C13: registrar siempre al actor).
 * {@code estadoAnterior} es nulo solo en el alta del incidente.
 */
public record CambioDeEstado(String estadoAnterior, String estadoNuevo, Usuario actor, LocalDateTime fecha,
                             String motivo) {

    public CambioDeEstado {
        Objects.requireNonNull(estadoNuevo, "estadoNuevo");
        Objects.requireNonNull(actor, "actor");
        Objects.requireNonNull(fecha, "fecha");
    }
}
