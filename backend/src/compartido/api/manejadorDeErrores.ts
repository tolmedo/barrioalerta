import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ConflictoDeEstadoError, ReglaDeNegocioError } from '../dominio/errores.js';

/** Cuerpo uniforme de todas las respuestas de error de la API. */
export interface ErrorRespuesta {
  codigo: string;
  mensaje: string;
  detalles: string[];
}

const error = (codigo: string, mensaje: string, detalles: string[] = []): ErrorRespuesta => ({
  codigo,
  mensaje,
  detalles,
});

export const rutaNoEncontrada: RequestHandler = (pedido, respuesta) => {
  respuesta.status(404).json(error('NO_ENCONTRADO', `No existe ${pedido.method} ${pedido.originalUrl}`));
};

/** Traduce errores a códigos HTTP. Nunca se responde 200 ante un error (C13 · Errores más comunes). */
export const manejadorDeErrores: ErrorRequestHandler = (causa, _pedido, respuesta, _siguiente) => {
  if (causa instanceof ConflictoDeEstadoError) {
    respuesta.status(409).json(error('CONFLICTO_DE_ESTADO', causa.message));
  } else if (causa instanceof ReglaDeNegocioError) {
    respuesta.status(422).json(error('REGLA_DE_NEGOCIO', causa.message));
  } else if (causa instanceof SyntaxError && 'body' in causa) {
    respuesta.status(400).json(error('DATOS_INVALIDOS', 'El cuerpo del pedido no es JSON válido'));
  } else {
    console.error('Error no controlado', causa);
    respuesta.status(500).json(error('ERROR_INTERNO', 'Ocurrió un error inesperado'));
  }
};
