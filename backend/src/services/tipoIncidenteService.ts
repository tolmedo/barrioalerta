import * as tipoIncidenteRepo from '../repositories/tipoIncidenteRepository.js';
import { formatearTipo } from '../utils/incidenteUtils.js';

export const getTipos = async () => (await tipoIncidenteRepo.getAll()).map(formatearTipo);
