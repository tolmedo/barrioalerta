import { AppDataSource } from '../db/connection.js';
import { type CuadrillaFila, CuadrillaSchema } from '../db/schemas/CuadrillaSchema.js';
import { Cuadrilla } from '../models/Cuadrilla.js';
import { Ubicacion } from '../models/Ubicacion.js';
import { exigirId } from '../utils/persistenciaUtils.js';
import { aTipoIncidente } from './tipoIncidenteRepository.js';
import { aUsuario, RELACIONES_USUARIO } from './usuarioRepository.js';

const repo = () => AppDataSource.getRepository(CuadrillaSchema);

export const RELACIONES_CUADRILLA = { especialidades: true, miembros: RELACIONES_USUARIO } as const;

export const aCuadrilla = (fila: CuadrillaFila) =>
  new Cuadrilla(
    fila.nombre,
    new Ubicacion(fila.baseLatitud, fila.baseLongitud, fila.baseDireccion, fila.baseBarrio),
    fila.especialidades.map(aTipoIncidente),
    fila.miembros.map(aUsuario),
    fila.id,
  );

export const getAll = async () =>
  (await repo().find({ relations: RELACIONES_CUADRILLA, order: { nombre: 'ASC' } })).map(aCuadrilla);

export const getById = async (id: number) => {
  const fila = await repo().findOne({ where: { id }, relations: RELACIONES_CUADRILLA });
  return fila ? aCuadrilla(fila) : null;
};

export const create = async (cuadrilla: Cuadrilla) => {
  const { id } = await repo().save({
    nombre: cuadrilla.nombre,
    baseLatitud: cuadrilla.base.latitud,
    baseLongitud: cuadrilla.base.longitud,
    baseDireccion: cuadrilla.base.direccion,
    baseBarrio: cuadrilla.base.barrio,
    especialidades: cuadrilla.especialidades.map((tipo) => ({ id: exigirId(tipo, `El tipo ${tipo.nombre}`) })),
    miembros: cuadrilla.miembros.map((miembro) => ({ id: exigirId(miembro, `El usuario ${miembro.username}`) })),
  });
  return (await getById(id))!;
};
