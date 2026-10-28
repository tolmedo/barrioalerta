package ar.utn.barrioalerta.incidentes.dominio.priorizacion;

import java.time.LocalDateTime;
import java.util.Set;

/** Datos que no pertenecen al incidente pero que las estrategias necesitan para puntuar. */
public record ContextoPriorizacion(LocalDateTime ahora, Set<String> barriosSensibles) {

    public ContextoPriorizacion {
        barriosSensibles = Set.copyOf(barriosSensibles);
    }
}
