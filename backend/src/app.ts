import express from 'express';

import saludRoutes from './routes/saludRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import incidenteRoutes from './routes/incidenteRoutes.js';
import tipoIncidenteRoutes from './routes/tipoIncidenteRoutes.js';
import cuadrillaRoutes from './routes/cuadrillaRoutes.js';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorLogger } from './middlewares/errorLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { verificarToken } from './middlewares/authHandler.js';

const app = express();

app.use(express.json());

// (sin token)
app.use('/api/salud', saludRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Protegidas (piden token)
app.use('/api/incidentes', verificarToken, incidenteRoutes);
app.use('/api/tipos-incidente', verificarToken, tipoIncidenteRoutes);
app.use('/api/cuadrillas', verificarToken, cuadrillaRoutes);

app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

export default app;
