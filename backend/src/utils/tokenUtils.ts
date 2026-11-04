import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'barrioalerta_secret';
const DURACION = '8h';

/** Lo que viaja dentro del token: alcanza para saber quién hace cada pedido. */
export interface UsuarioToken {
  username: string;
  rol: string;
}

export const generarToken = (usuario: UsuarioToken) =>
  jwt.sign({ username: usuario.username, rol: usuario.rol }, JWT_SECRET, { expiresIn: DURACION });

/** Devuelve el usuario del token, o lanza un error si es inválido o venció. */
export const leerToken = (token: string): UsuarioToken => {
  const payload = jwt.verify(token, JWT_SECRET);
  if (typeof payload === 'string' || typeof payload.username !== 'string' || typeof payload.rol !== 'string') {
    throw new Error('Token con formato inválido');
  }
  return { username: payload.username, rol: payload.rol };
};
