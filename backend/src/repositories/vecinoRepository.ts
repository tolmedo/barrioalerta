import { AppDataSource } from '../db/connection.js';
import { type VecinoFila, VecinoSchema } from '../db/schemas/VecinoSchema.js';
import type { TipoCanal } from '../models/Permiso.js';
import { Vecino } from '../models/Vecino.js';
import { exigirId } from '../utils/persistenciaUtils.js';
import { aUsuario, RELACIONES_USUARIO } from './usuarioRepository.js';

const repo = () => AppDataSource.getRepository(VecinoSchema);

export const RELACIONES_VECINO = { usuario: RELACIONES_USUARIO } as const;

export const aVecino = (fila: VecinoFila) =>
  new Vecino(fila.nombre, aUsuario(fila.usuario), fila.barrio, fila.canalPreferido as TipoCanal, fila.id);

export const getById = async (id: number) => {
  const fila = await repo().findOne({ where: { id }, relations: RELACIONES_VECINO });
  return fila ? aVecino(fila) : null;
};

export const getByUsername = async (username: string) => {
  const fila = await repo().findOne({ where: { usuario: { username } }, relations: RELACIONES_VECINO });
  return fila ? aVecino(fila) : null;
};

export const create = async (vecino: Vecino) => {
  const { id } = await repo().save({
    nombre: vecino.nombre,
    barrio: vecino.barrio,
    canalPreferido: vecino.canalPreferido,
    usuario: { id: exigirId(vecino.usuario, `El usuario ${vecino.usuario.username}`) },
  });
  return (await getById(id))!;
};
