import { AppDataSource } from '../db/connection.js';
import { type UsuarioFila, UsuarioSchema } from '../db/schemas/UsuarioSchema.js';
import { Usuario } from '../models/Usuario.js';
import { exigirId } from '../utils/persistenciaUtils.js';
import { aRol } from './rolRepository.js';

const repo = () => AppDataSource.getRepository(UsuarioSchema);

export const RELACIONES_USUARIO = { rol: { permisos: true } } as const;

export const aUsuario = (fila: UsuarioFila) => new Usuario(fila.username, aRol(fila.rol), fila.id);

export const getById = async (id: number) => {
  const fila = await repo().findOne({ where: { id }, relations: RELACIONES_USUARIO });
  return fila ? aUsuario(fila) : null;
};

export const getByUsername = async (username: string) => {
  const fila = await repo().findOne({ where: { username }, relations: RELACIONES_USUARIO });
  return fila ? aUsuario(fila) : null;
};

/** Para el login: el usuario y el hash de su contraseña, que no forma parte del modelo de dominio. */
export const getCredenciales = async (username: string) => {
  const fila = await repo().findOne({ where: { username }, relations: RELACIONES_USUARIO });
  return fila ? { usuario: aUsuario(fila), passwordHash: fila.passwordHash } : null;
};

export const create = async (usuario: Usuario, passwordHash: string | null = null) => {
  const { id } = await repo().save({
    username: usuario.username,
    passwordHash,
    rol: { id: exigirId(usuario.rol, `El rol ${usuario.rol.nombre}`) },
  });
  return (await getById(id))!;
};
