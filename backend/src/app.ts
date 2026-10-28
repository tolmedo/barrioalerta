import express from 'express';

import saludRoutes from './routes/saludRoutes.js';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorLogger } from './middlewares/errorLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/salud', saludRoutes);

app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

export default app;
