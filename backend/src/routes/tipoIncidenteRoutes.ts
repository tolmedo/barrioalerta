import { Router } from 'express';
import * as controller from '../controllers/tipoIncidenteController.js';

const router = Router();

router.get('/', controller.getTipos);

export default router;
