package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.Objects;

/** Foto (y nota opcional) que deja la cuadrilla al resolver. La foto se guarda en disco; acá va su ruta. */
public record Evidencia(String rutaFoto, String nota, Usuario autor, LocalDateTime fecha) {

    public Evidencia {
        if (rutaFoto == null || rutaFoto.isBlank()) {
            throw new IllegalArgumentException("La evidencia necesita una foto");
        }
        Objects.requireNonNull(autor, "autor");
        Objects.requireNonNull(fecha, "fecha");
    }
}
