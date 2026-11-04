import express from 'express';

import saludRoutes from './routes/saludRoutes.js';
import incidenteRoutes from './routes/incidenteRoutes.js';
import tipoIncidenteRoutes from './routes/tipoIncidenteRoutes.js';
import cuadrillaRoutes from './routes/cuadrillaRoutes.js';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorLogger } from './middlewares/errorLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/salud', saludRoutes);
app.use('/api/incidentes', incidenteRoutes);
app.use('/api/tipos-incidente', tipoIncidenteRoutes);
app.use('/api/cuadrillas', cuadrillaRoutes);

app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

export default app;
