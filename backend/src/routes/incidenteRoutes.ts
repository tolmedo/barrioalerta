import { Router } from 'express';
import * as controller from '../controllers/incidenteController.js';

const router = Router();

router.get('/', controller.getIncidentes);
router.get('/:id', controller.getIncidenteById);
router.post('/', controller.reportarIncidente);
router.post('/:id/cambios-de-estado', controller.cambiarEstado);

export default router;
