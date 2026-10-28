/**
 * Acciones que cambian el estado de un incidente. El front muestra solo las que devuelve
 * Incidente.accionesPermitidas(), así nunca ofrece una transición inválida.
 */
export enum Accion {
  VALIDAR = 'VALIDAR',
  RECHAZAR = 'RECHAZAR',
  MARCAR_DUPLICADO = 'MARCAR_DUPLICADO',
  ASIGNAR = 'ASIGNAR',
  INICIAR_TRABAJO = 'INICIAR_TRABAJO',
  RESOLVER = 'RESOLVER',
  REABRIR = 'REABRIR',
  CERRAR = 'CERRAR',
}

/** Cómo se lee cada acción en un mensaje de error: "No se puede {verbo} un incidente en estado X". */
export const VERBOS: Readonly<Record<Accion, string>> = {
  [Accion.VALIDAR]: 'validar',
  [Accion.RECHAZAR]: 'rechazar',
  [Accion.MARCAR_DUPLICADO]: 'marcar como duplicado',
  [Accion.ASIGNAR]: 'asignar',
  [Accion.INICIAR_TRABAJO]: 'iniciar el trabajo de',
  [Accion.RESOLVER]: 'resolver',
  [Accion.REABRIR]: 'reabrir',
  [Accion.CERRAR]: 'cerrar',
};
