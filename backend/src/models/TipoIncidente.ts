/**
 * Tipo configurable por el administrador (patrón Type Object). Los tipos difieren solo en datos
 * (nombre y SLA), por eso no se modelan como subclases de Incidente.
 */
export class TipoIncidente {
  constructor(
    readonly nombre: string,
    readonly slaHoras: number,
  ) {
    if (!nombre.trim()) {
      throw new Error('El nombre del tipo es obligatorio');
    }
    if (slaHoras <= 0) {
      throw new Error('El SLA debe ser positivo');
    }
  }

  esIgualA(otro: TipoIncidente): boolean {
    return this.nombre === otro.nombre;
  }
}
