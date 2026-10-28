package ar.utn.barrioalerta.incidentes.dominio.priorizacion;

import ar.utn.barrioalerta.incidentes.dominio.Incidente;

/**
 * Patrón Strategy (C06 · PATRON STRATEGY): formas intercambiables de puntuar un incidente.
 * Agregar un criterio nuevo es agregar una implementación, sin tocar las existentes (OCP).
 * <p>
 * Implementaciones previstas para H2 (I2): {@code PriorizacionPonderada} y
 * {@code PriorizacionPorRiesgoSla}. Ver la sección D6 del lineamiento.
 */
public interface EstrategiaPriorizacion {

    /** Puntaje normalizado entre 0 (menos urgente) y 1 (más urgente). */
    double puntuar(Incidente incidente, ContextoPriorizacion contexto);

    /** Identificador con el que se elige la estrategia desde la configuración o la UI. */
    String nombre();
}
