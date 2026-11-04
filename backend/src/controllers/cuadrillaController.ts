import type { RequestHandler } from 'express';
import * as service from '../services/cuadrillaService.js';

export const getCuadrillas: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await service.getCuadrillas());
  } catch (e) { next(e); }
};
