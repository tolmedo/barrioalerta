import { Router } from 'express';
import * as controller from '../controllers/saludController.js';

const router = Router();

router.get('/', controller.getSalud);

export default router;
