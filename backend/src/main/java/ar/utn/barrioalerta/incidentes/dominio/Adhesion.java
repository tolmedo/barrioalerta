package ar.utn.barrioalerta.incidentes.dominio;

import java.time.LocalDateTime;
import java.util.Objects;

/** Un vecino que reporta el mismo problema se suma al incidente existente en lugar de duplicarlo. */
public record Adhesion(Vecino vecino, LocalDateTime fecha) {

    public Adhesion {
        Objects.requireNonNull(vecino, "vecino");
        Objects.requireNonNull(fecha, "fecha");
    }
}
