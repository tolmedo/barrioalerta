/**
 * Tipo configurable por el administrador (patrón Type Object). Los tipos difieren solo en datos
 * (gravedad, SLA, radio de duplicado), por eso no se modelan como subclases de Incidente.
 */
export class TipoIncidente {
  constructor(
    readonly nombre: string,
    readonly gravedad: number,
    readonly slaHoras: number,
    readonly radioDuplicadoMetros: number,
  ) {
    if (!nombre.trim()) {
      throw new Error('El nombre del tipo es obligatorio');
    }
    if (gravedad < 0 || gravedad > 1) {
      throw new Error('La gravedad debe estar entre 0 y 1');
    }
    if (slaHoras <= 0 || radioDuplicadoMetros <= 0) {
      throw new Error('El SLA y el radio de duplicado deben ser positivos');
    }
  }

  esIgualA(otro: TipoIncidente): boolean {
    return this.nombre === otro.nombre;
  }
}
