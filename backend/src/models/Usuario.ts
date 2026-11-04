import { Permiso } from './Permiso.js';

export class Rol {
  private readonly permisos: ReadonlySet<Permiso>;

  constructor(
    readonly nombre: string,
    permisos: Iterable<Permiso>,
    readonly id?: number,
  ) {
    this.permisos = new Set(permisos);
  }

  tenesPermiso(permiso: Permiso): boolean {
    return this.permisos.has(permiso);
  }

  get listaDePermisos(): Permiso[] {
    return [...this.permisos];
  }
}

/**
 * Datos de acceso de una persona. Los actores de dominio que tienen relaciones
 * propias (Vecino, miembros de Cuadrilla) referencian a su Usuario; Operador y Admin son solo un rol.
 */
export class Usuario {
  constructor(
    readonly username: string,
    readonly rol: Rol,
    readonly id?: number,
  ) {
    if (!username.trim()) {
      throw new Error('El username es obligatorio');
    }
  }

  tenesPermiso(permiso: Permiso): boolean {
    return this.rol.tenesPermiso(permiso);
  }

  esIgualA(otro: Usuario): boolean {
    return this.username === otro.username;
  }

  toString(): string {
    return this.username;
  }
}
