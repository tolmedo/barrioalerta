import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/AppError.js';
import { leerToken, type UsuarioToken } from '../utils/tokenUtils.js';

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

export const verificarToken: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token requerido'));
  }

  try {
    req.usuario = leerToken(authHeader.slice('Bearer '.length));
    next();
  } catch {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
};

/** El usuario del token. Solo se usa en rutas protegidas por verificarToken. */
export const usuarioAutenticado = (req: Express.Request): UsuarioToken => {
  if (!req.usuario) {
    throw new UnauthorizedError('Token requerido');
  }
  return req.usuario;
};
