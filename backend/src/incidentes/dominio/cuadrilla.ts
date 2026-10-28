import type { Usuario } from '../../identidad/dominio/usuario.js';
import type { TipoIncidente } from './tipoIncidente.js';
import type { Ubicacion } from './ubicacion.js';

/**
 * Equipo de trabajo del municipio. Vive en el módulo de incidentes (y no en el de asignación)
 * porque Incidente la referencia: así las dependencias entre módulos van en un solo sentido
 * (asignación → incidentes) y no hay ciclos.
 */
export class Cuadrilla {
  readonly especialidades: readonly TipoIncidente[];
  readonly miembros: readonly Usuario[];

  constructor(
    readonly nombre: string,
    readonly base: Ubicacion,
    especialidades: readonly TipoIncidente[],
    miembros: readonly Usuario[],
  ) {
    if (miembros.length === 0) {
      throw new Error('Una cuadrilla necesita al menos un miembro');
    }
    this.especialidades = [...especialidades];
    this.miembros = [...miembros];
  }

  puedeAtender(tipo: TipoIncidente): boolean {
    return this.especialidades.some((especialidad) => especialidad.esIgualA(tipo));
  }

  tieneMiembro(usuario: Usuario): boolean {
    return this.miembros.some((miembro) => miembro.esIgualA(usuario));
  }

  esIgualA(otra: Cuadrilla): boolean {
    return this.nombre === otra.nombre;
  }
}
