import { AppDataSource } from '../db/connection.js';
import { type RolFila, RolSchema } from '../db/schemas/RolSchema.js';
import type { Permiso } from '../models/Permiso.js';
import { Rol } from '../models/Usuario.js';

const repo = () => AppDataSource.getRepository(RolSchema);

export const aRol = (fila: RolFila) => new Rol(fila.nombre, fila.permisos.map((p) => p.permiso as Permiso), fila.id);

export const getByNombre = async (nombre: string) => {
  const fila = await repo().findOne({ where: { nombre }, relations: { permisos: true } });
  return fila ? aRol(fila) : null;
};

export const create = async (rol: Rol) =>
  aRol(await repo().save({ nombre: rol.nombre, permisos: rol.listaDePermisos.map((permiso) => ({ permiso })) }) as RolFila);
