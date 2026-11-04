import bcrypt from 'bcryptjs';
import * as usuarioRepo from '../repositories/usuarioRepository.js';
import * as vecinoRepo from '../repositories/vecinoRepository.js';
import { BadRequestError, UnauthorizedError } from '../errors/AppError.js';
import { generarToken } from '../utils/tokenUtils.js';

export interface PedidoLogin {
  username?: string;
  password?: string;
}

/** Devuelve el token y los datos que el front necesita para armar la sesión (rol, permisos y, si es vecino, su perfil). */
const login = async ({ username, password }: PedidoLogin) => {
  if (!username || !password) throw new BadRequestError('El usuario y la contraseña son obligatorios');

  const credenciales = await usuarioRepo.getCredenciales(username);
  // Mismo mensaje si no existe el usuario o si la contraseña es incorrecta, para no revelar cuál falló
  if (!credenciales?.passwordHash || !(await bcrypt.compare(password, credenciales.passwordHash))) {
    throw new UnauthorizedError('Usuario o contraseña incorrectos');
  }

  const { usuario } = credenciales;
  const vecino = await vecinoRepo.getByUsername(usuario.username);

  return {
    token: generarToken({ username: usuario.username, rol: usuario.rol.nombre }),
    usuario: {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol.nombre,
      permisos: usuario.rol.listaDePermisos,
      vecino: vecino ? { id: vecino.id, nombre: vecino.nombre, barrio: vecino.barrio } : null,
    },
  };
};

export { login };
