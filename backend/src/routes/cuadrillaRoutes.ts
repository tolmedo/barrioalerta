import { Router } from 'express';
import * as controller from '../controllers/cuadrillaController.js';

const router = Router();

router.get('/', controller.getCuadrillas);

export default router;
