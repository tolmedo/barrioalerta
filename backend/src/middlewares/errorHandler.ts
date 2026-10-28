import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Errores propios: BadRequestError, NotFoundError, ConflictError, etc.
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: err.timestamp,
      path: req.originalUrl,
    });
    return;
  }

  // JSON mal formado en el body
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      status: 'fail',
      message: 'JSON inválido en el body',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
    return;
  }

  console.error('ERROR NO CONTROLADO:', err);

  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
