import type { RequestHandler } from 'express';
import { usuarioAutenticado } from '../middlewares/authHandler.js';
import * as service from '../services/incidenteService.js';

const getIncidentes: RequestHandler = async (req, res, next) => {
  try {
    const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
    res.json(await service.getIncidentes(estado));
  } catch (e) { next(e); }
};

const getIncidenteById: RequestHandler = async (req, res, next) => {
  try {
    res.json(await service.getIncidenteById(req.params.id));
  } catch (e) { next(e); }
};

const reportarIncidente: RequestHandler = async (req, res, next) => {
  try {
    res.status(201).json(await service.reportarIncidente(req.body ?? {}, usuarioAutenticado(req).username));
  } catch (e) { next(e); }
};

const cambiarEstado: RequestHandler = async (req, res, next) => {
  try {
    res.status(201).json(await service.cambiarEstado(req.params.id, req.body ?? {}, usuarioAutenticado(req).username));
  } catch (e) { next(e); }
};

export { getIncidentes, getIncidenteById, reportarIncidente, cambiarEstado };
