import type { Usuario } from './Usuario.js';
import type { TipoIncidente } from './TipoIncidente.js';
import type { Ubicacion } from './Ubicacion.js';

/**
 * Equipo de trabajo del municipio. No conoce sus incidentes: es Incidente el que la referencia, así
 * la relación va en un solo sentido. La carga de trabajo la calcula el servicio de asignación.
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
