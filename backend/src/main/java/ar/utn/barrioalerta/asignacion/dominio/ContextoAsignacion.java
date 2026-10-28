package ar.utn.barrioalerta.asignacion.dominio;

import ar.utn.barrioalerta.incidentes.dominio.Cuadrilla;
import java.util.Map;

/**
 * Datos calculados por el servicio (no guardados en la Cuadrilla), para evitar una relación
 * bidireccional Cuadrilla ↔ Incidente.
 */
public record ContextoAsignacion(Map<Cuadrilla, Integer> incidentesActivosPorCuadrilla) {

    public ContextoAsignacion {
        incidentesActivosPorCuadrilla = Map.copyOf(incidentesActivosPorCuadrilla);
    }

    public int cargaDe(Cuadrilla cuadrilla) {
        return incidentesActivosPorCuadrilla.getOrDefault(cuadrilla, 0);
    }
}
