import { EntitySchema } from 'typeorm';
import type { UsuarioFila } from './UsuarioSchema.js';

export interface VecinoFila {
  id: number;
  nombre: string;
  barrio: string;
  canalPreferido: string;
  usuario: UsuarioFila;
}

export const VecinoSchema = new EntitySchema<VecinoFila>({
  name: 'Vecino',
  tableName: 'vecino',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    nombre: { type: 'varchar' },
    barrio: { type: 'varchar' },
    canalPreferido: { name: 'canal_preferido', type: 'varchar' },
  },
  relations: {
    usuario: { type: 'one-to-one', target: 'Usuario', joinColumn: { name: 'usuario_id' }, nullable: false },
  },
});
