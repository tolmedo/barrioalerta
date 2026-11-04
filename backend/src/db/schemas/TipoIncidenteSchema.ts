import { EntitySchema } from 'typeorm';

export interface TipoIncidenteFila {
  id: number;
  nombre: string;
  slaHoras: number;
}

export const TipoIncidenteSchema = new EntitySchema<TipoIncidenteFila>({
  name: 'TipoIncidente',
  tableName: 'tipo_incidente',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    nombre: { type: 'varchar', unique: true },
    slaHoras: { name: 'sla_horas', type: 'int' },
  },
});
