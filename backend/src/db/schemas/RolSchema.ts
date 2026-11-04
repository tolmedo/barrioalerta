import { EntitySchema } from 'typeorm';

export interface RolFila {
  id: number;
  nombre: string;
  permisos: RolPermisoFila[];
}

export interface RolPermisoFila {
  rolId: number;
  permiso: string;
  rol?: RolFila;
}

export const RolSchema = new EntitySchema<RolFila>({
  name: 'Rol',
  tableName: 'rol',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    nombre: { type: 'varchar', unique: true },
  },
  relations: {
    permisos: { type: 'one-to-many', target: 'RolPermiso', inverseSide: 'rol', cascade: true },
  },
});

/** Los permisos de un rol, uno por fila (el enum Permiso se guarda por nombre). */
export const RolPermisoSchema = new EntitySchema<RolPermisoFila>({
  name: 'RolPermiso',
  tableName: 'rol_permiso',
  columns: {
    rolId: { name: 'rol_id', type: 'int', primary: true },
    permiso: { type: 'varchar', primary: true },
  },
  relations: {
    rol: { type: 'many-to-one', target: 'Rol', joinColumn: { name: 'rol_id' }, onDelete: 'CASCADE' },
  },
});
