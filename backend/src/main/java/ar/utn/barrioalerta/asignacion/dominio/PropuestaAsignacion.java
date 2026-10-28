package ar.utn.barrioalerta.asignacion.dominio;

import ar.utn.barrioalerta.incidentes.dominio.Cuadrilla;
import java.util.Objects;

/** Resultado de una estrategia: la cuadrilla, su puntaje y una explicación legible para el operador. */
public record PropuestaAsignacion(Cuadrilla cuadrilla, double score, String justificacion) {

    public PropuestaAsignacion {
        Objects.requireNonNull(cuadrilla, "cuadrilla");
        if (score < 0 || score > 1) {
            throw new IllegalArgumentException("El score debe estar entre 0 y 1");
        }
    }
}
