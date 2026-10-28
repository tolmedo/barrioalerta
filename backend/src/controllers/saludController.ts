import type { RequestHandler } from 'express';
import * as service from '../services/saludService.js';

export const getSalud: RequestHandler = (_req, res, next) => {
  try {
    res.json(service.obtenerSalud());
  } catch (e) { next(e); }
};
