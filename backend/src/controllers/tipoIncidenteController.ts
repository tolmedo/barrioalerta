import type { RequestHandler } from 'express';
import * as service from '../services/tipoIncidenteService.js';

export const getTipos: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await service.getTipos());
  } catch (e) { next(e); }
};
