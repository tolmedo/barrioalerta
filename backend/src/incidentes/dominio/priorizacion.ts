import type { Incidente } from './incidente.js';

/** Datos que no pertenecen al incidente pero que las estrategias necesitan para puntuar. */
export interface ContextoPriorizacion {
  readonly ahora: Date;
  readonly barriosSensibles: ReadonlySet<string>;
}

/**
 * Patrón Strategy (C06 · PATRON STRATEGY): formas intercambiables de puntuar un incidente.
 * Agregar un criterio nuevo es agregar una implementación, sin tocar las existentes (OCP).
 *
 * Pendiente H2 (I2): PriorizacionPonderada y PriorizacionPorRiesgoSla.
 */
export interface EstrategiaPriorizacion {
  /** Identificador con el que se elige la estrategia desde la configuración o la UI. */
  readonly nombre: string;

  /** Puntaje normalizado entre 0 (menos urgente) y 1 (más urgente). */
  puntuar(incidente: Incidente, contexto: ContextoPriorizacion): number;
}
