import type { Usuario } from './Usuario.js';
import type { NombreEstado } from './EstadoIncidente.js';
import type { Vecino } from './Vecino.js';

/**
 * Entrada de auditoría: quién, qué, cuándo y por qué (C13: registrar siempre al actor).
 * `estadoAnterior` es null solo en el alta del incidente.
 */
export interface CambioDeEstado {
  readonly estadoAnterior: NombreEstado | null;
  readonly estadoNuevo: NombreEstado;
  readonly actor: Usuario;
  readonly fecha: Date;
  readonly motivo: string | null;
}

/** Un vecino que reporta el mismo problema se suma al incidente existente en lugar de duplicarlo. */
export interface Adhesion {
  readonly vecino: Vecino;
  readonly fecha: Date;
}

/** Foto (y nota opcional) que deja la cuadrilla al resolver. La foto se guarda en disco; acá va su ruta. */
export class Evidencia {
  constructor(
    readonly rutaFoto: string,
    readonly nota: string | null,
    readonly autor: Usuario,
    readonly fecha: Date,
  ) {
    if (!rutaFoto.trim()) {
      throw new Error('La evidencia necesita una foto');
    }
  }
}
