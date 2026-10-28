/**
 * Raíz de los errores que expresan una regla del negocio violada. La capa API los traduce a
 * códigos HTTP sin que el dominio conozca HTTP.
 */
export abstract class ErrorDeDominio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** La operación no es válida para el estado actual del objeto (se traduce a HTTP 409). */
export class ConflictoDeEstadoError extends ErrorDeDominio {}

/** Los datos son válidos en forma pero violan una regla del negocio (se traduce a HTTP 422). */
export class ReglaDeNegocioError extends ErrorDeDominio {}
