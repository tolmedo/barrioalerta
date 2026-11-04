import { EntitySchema } from 'typeorm';
import type { RolFila } from './RolSchema.js';

export interface UsuarioFila {
  id: number;
  username: string;
  passwordHash: string | null;
  rol: RolFila;
}

export const UsuarioSchema = new EntitySchema<UsuarioFila>({
  name: 'Usuario',
  tableName: 'usuario',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    username: { type: 'varchar', unique: true },
    passwordHash: { name: 'password_hash', type: 'varchar', nullable: true },
  },
  relations: {
    rol: { type: 'many-to-one', target: 'Rol', joinColumn: { name: 'rol_id' }, nullable: false },
  },
});
