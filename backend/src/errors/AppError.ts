export class AppError extends Error {
  readonly statusCode: number;
  readonly status: 'fail' | 'error';
  readonly timestamp: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.timestamp = new Date().toISOString();
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

/** La operación no es válida para el estado actual del objeto (por ejemplo, una transición inválida). */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/** Los datos son válidos en forma pero violan una regla del negocio. */
export class UnprocessableEntityError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}
