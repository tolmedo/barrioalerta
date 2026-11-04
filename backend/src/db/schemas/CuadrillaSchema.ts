import { EntitySchema } from 'typeorm';
import type { TipoIncidenteFila } from './TipoIncidenteSchema.js';
import type { UsuarioFila } from './UsuarioSchema.js';

export interface CuadrillaFila {
  id: number;
  nombre: string;
  baseLatitud: number;
  baseLongitud: number;
  baseDireccion: string;
  baseBarrio: string;
  especialidades: TipoIncidenteFila[];
  miembros: UsuarioFila[];
}

/** La base (Ubicacion) va embebida en columnas porque es un Value Object sin identidad. */
export const CuadrillaSchema = new EntitySchema<CuadrillaFila>({
  name: 'Cuadrilla',
  tableName: 'cuadrilla',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    nombre: { type: 'varchar', unique: true },
    baseLatitud: { name: 'base_latitud', type: 'double precision' },
    baseLongitud: { name: 'base_longitud', type: 'double precision' },
    baseDireccion: { name: 'base_direccion', type: 'varchar' },
    baseBarrio: { name: 'base_barrio', type: 'varchar' },
  },
  relations: {
    especialidades: {
      type: 'many-to-many',
      target: 'TipoIncidente',
      joinTable: {
        name: 'cuadrilla_especialidad',
        joinColumn: { name: 'cuadrilla_id' },
        inverseJoinColumn: { name: 'tipo_incidente_id' },
      },
    },
    miembros: {
      type: 'many-to-many',
      target: 'Usuario',
      joinTable: {
        name: 'cuadrilla_miembro',
        joinColumn: { name: 'cuadrilla_id' },
        inverseJoinColumn: { name: 'usuario_id' },
      },
    },
  },
});
