import type { RequestHandler } from 'express';
import * as service from '../services/usuarioService.js';

export const login: RequestHandler = async (req, res, next) => {
  try {
    res.json(await service.login(req.body ?? {}));
  } catch (e) { next(e); }
};
