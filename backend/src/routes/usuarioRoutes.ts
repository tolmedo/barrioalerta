import { Router } from 'express';
import * as controller from '../controllers/usuarioController.js';

const router = Router();

router.post('/login', controller.login);

export default router;
