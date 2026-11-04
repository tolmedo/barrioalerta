import { BadRequestError } from '../errors/AppError.js';

/** Los ids llegan como texto (parámetros de la URL) o como número (body); siempre deben ser enteros positivos. */
export const validarId = (valor: unknown, campo: string): number => {
  const id = Number(valor);
  if (valor === undefined || valor === null || valor === '' || !Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`${campo} debe ser un número entero positivo`);
  }
  return id;
};
