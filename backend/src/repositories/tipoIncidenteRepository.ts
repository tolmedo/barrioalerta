import { AppDataSource } from '../db/connection.js';
import { type TipoIncidenteFila, TipoIncidenteSchema } from '../db/schemas/TipoIncidenteSchema.js';
import { TipoIncidente } from '../models/TipoIncidente.js';

const repo = () => AppDataSource.getRepository(TipoIncidenteSchema);

export const aTipoIncidente = (fila: TipoIncidenteFila) => new TipoIncidente(fila.nombre, fila.slaHoras, fila.id);

export const getAll = async () => (await repo().find({ order: { nombre: 'ASC' } })).map(aTipoIncidente);

export const getById = async (id: number) => {
  const fila = await repo().findOneBy({ id });
  return fila ? aTipoIncidente(fila) : null;
};

export const create = async (tipo: TipoIncidente) =>
  aTipoIncidente(await repo().save({ nombre: tipo.nombre, slaHoras: tipo.slaHoras }));
