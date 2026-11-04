import * as cuadrillaRepo from '../repositories/cuadrillaRepository.js';
import { formatearCuadrilla } from '../utils/incidenteUtils.js';

export const getCuadrillas = async () => (await cuadrillaRepo.getAll()).map(formatearCuadrilla);
