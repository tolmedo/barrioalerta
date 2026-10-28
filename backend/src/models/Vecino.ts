import { TipoCanal } from './Permiso.js';
import type { Usuario } from './Usuario.js';

/** Actor con relaciones propias en el dominio (reporta, adhiere, reabre), por eso es una entidad. */
export class Vecino {
  private _canalPreferido: TipoCanal;

  constructor(
    readonly nombre: string,
    readonly usuario: Usuario,
    readonly barrio: string,
    canalPreferido: TipoCanal = TipoCanal.IN_APP,
  ) {
    this._canalPreferido = canalPreferido;
  }

  get canalPreferido(): TipoCanal {
    return this._canalPreferido;
  }

  cambiarCanalPreferido(canal: TipoCanal): void {
    this._canalPreferido = canal;
  }
}
