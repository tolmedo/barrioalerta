import type { ErrorRequestHandler } from 'express';

export const errorLogger: ErrorRequestHandler = (err, req, _res, next) => {
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });

  next(err);
};
