package ar.utn.barrioalerta.asignacion.dominio;

import ar.utn.barrioalerta.incidentes.dominio.Cuadrilla;
import ar.utn.barrioalerta.incidentes.dominio.Incidente;
import java.util.List;

/**
 * Segunda familia de Strategy, distinta de la priorización: acá el operador elige con qué criterio
 * se proponen cuadrillas. No confundir con State (C13): el incidente no cambia de algoritmo solo,
 * lo elige una persona.
 */
public interface EstrategiaAsignacion {

    /** Propuestas ordenadas de mejor a peor, solo con cuadrillas que pueden atender el tipo. */
    List<PropuestaAsignacion> proponer(Incidente incidente, List<Cuadrilla> cuadrillas, ContextoAsignacion contexto);

    String nombre();
}
