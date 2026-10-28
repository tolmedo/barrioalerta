import type { Cuadrilla } from '../../incidentes/dominio/cuadrilla.js';
import type { Incidente } from '../../incidentes/dominio/incidente.js';

/** Resultado de una estrategia: la cuadrilla, su puntaje y una explicación legible para el operador. */
export class PropuestaAsignacion {
  constructor(
    readonly cuadrilla: Cuadrilla,
    readonly score: number,
    readonly justificacion: string,
  ) {
    if (score < 0 || score > 1) {
      throw new Error('El score debe estar entre 0 y 1');
    }
  }
}

/**
 * Datos calculados por el servicio (no guardados en la Cuadrilla), para evitar una relación
 * bidireccional Cuadrilla ↔ Incidente.
 */
export class ContextoAsignacion {
  private readonly incidentesActivosPorCuadrilla: ReadonlyMap<string, number>;

  /** @param incidentesActivosPorCuadrilla nombre de la cuadrilla → cantidad de incidentes activos */
  constructor(incidentesActivosPorCuadrilla: ReadonlyMap<string, number>) {
    this.incidentesActivosPorCuadrilla = new Map(incidentesActivosPorCuadrilla);
  }

  cargaDe(cuadrilla: Cuadrilla): number {
    return this.incidentesActivosPorCuadrilla.get(cuadrilla.nombre) ?? 0;
  }
}

/**
 * Patrón Strategy (C06 · PATRON STRATEGY): los dos algoritmos con puntaje entre 0 y 1 que pide la
 * E2 del enunciado. Agregar un criterio nuevo es agregar una implementación, sin tocar las
 * existentes (OCP). No confundir con State (C13): el incidente no cambia de algoritmo solo, lo
 * elige el operador.
 *
 * Pendiente H2 (I3): AsignacionPorCercania y AsignacionPorMenorCarga.
 */
export interface EstrategiaAsignacion {
  readonly nombre: string;

  /** Propuestas ordenadas de mejor a peor, solo con cuadrillas que pueden atender el tipo. */
  proponer(incidente: Incidente, cuadrillas: readonly Cuadrilla[], contexto: ContextoAsignacion): PropuestaAsignacion[];
}
