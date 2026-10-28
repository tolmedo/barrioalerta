import { Permiso } from './permiso.js';

export class Rol {
  private readonly permisos: ReadonlySet<Permiso>;

  constructor(
    readonly nombre: string,
    permisos: Iterable<Permiso>,
  ) {
    this.permisos = new Set(permisos);
  }

  tenesPermiso(permiso: Permiso): boolean {
    return this.permisos.has(permiso);
  }
}

const NOMBRE_SISTEMA = 'sistema';

/**
 * Datos de acceso de una persona o de otro sistema. Los actores de dominio que tienen relaciones
 * propias (Vecino, miembros de Cuadrilla) referencian a su Usuario; Operador y Admin son solo un rol.
 */
export class Usuario {
  /** Actor que firma las acciones automáticas (cierre por tiempo, escalamiento) en la auditoría. */
  static readonly SISTEMA = new Usuario(NOMBRE_SISTEMA, new Rol('SISTEMA', []));

  constructor(
    readonly username: string,
    readonly rol: Rol,
  ) {
    if (!username.trim()) {
      throw new Error('El username es obligatorio');
    }
  }

  tenesPermiso(permiso: Permiso): boolean {
    return this.rol.tenesPermiso(permiso);
  }

  esSistema(): boolean {
    return this.username === NOMBRE_SISTEMA;
  }

  esIgualA(otro: Usuario): boolean {
    return this.username === otro.username;
  }

  toString(): string {
    return this.username;
  }
}
