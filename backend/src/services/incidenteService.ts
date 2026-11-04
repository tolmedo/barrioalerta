import * as cuadrillaRepo from '../repositories/cuadrillaRepository.js';
import * as incidenteRepo from '../repositories/incidenteRepository.js';
import * as tipoIncidenteRepo from '../repositories/tipoIncidenteRepository.js';
import * as usuarioRepo from '../repositories/usuarioRepository.js';
import * as vecinoRepo from '../repositories/vecinoRepository.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/AppError.js';
import { Accion, VERBOS } from '../models/Accion.js';
import { EstadoIncidente } from '../models/EstadoIncidente.js';
import { Incidente } from '../models/Incidente.js';
import { Permiso } from '../models/Permiso.js';
import { Evidencia } from '../models/RegistrosIncidente.js';
import { Ubicacion } from '../models/Ubicacion.js';
import { formatearIncidente } from '../utils/incidenteUtils.js';
import { obtenerReloj } from '../utils/reloj.js';
import { validarId } from '../utils/validacionesUtils.js';

export interface PedidoReporte {
  tipoIncidenteId?: unknown;
  descripcion?: string;
  latitud?: unknown;
  longitud?: unknown;
  direccion?: string;
  barrio?: string;
}

export interface PedidoCambioDeEstado {
  accion?: string;
  motivo?: string;
  cuadrillaId?: unknown;
  originalId?: unknown;
  evidencia?: { rutaFoto?: string; nota?: string };
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const _buscarIncidente = async (id: number) => {
  const incidente = await incidenteRepo.getById(id);
  if (!incidente) throw new NotFoundError('Incidente no encontrado');
  return incidente;
};

const _buscarUsuario = async (username: string) => {
  const usuario = await usuarioRepo.getByUsername(username);
  if (!usuario) throw new NotFoundError(`No existe el usuario ${username}`);
  return usuario;
};

/** Reportar, reabrir y cerrar son acciones de vecinos: otro usuario recibe 403. */
const _buscarVecino = async (username: string) => {
  const vecino = await vecinoRepo.getByUsername(username);
  if (!vecino) throw new ForbiddenError('Solo un vecino puede hacer esta operación');
  return vecino;
};

const PERMISO_POR_ACCION: Readonly<Record<Accion, Permiso>> = {
  [Accion.VALIDAR]: Permiso.GESTIONAR_INCIDENTES,
  [Accion.RECHAZAR]: Permiso.GESTIONAR_INCIDENTES,
  [Accion.MARCAR_DUPLICADO]: Permiso.GESTIONAR_INCIDENTES,
  [Accion.ASIGNAR]: Permiso.ASIGNAR_CUADRILLAS,
  [Accion.INICIAR_TRABAJO]: Permiso.EJECUTAR_TRABAJOS,
  [Accion.RESOLVER]: Permiso.EJECUTAR_TRABAJOS,
  [Accion.REABRIR]: Permiso.REPORTAR_INCIDENTE,
  [Accion.CERRAR]: Permiso.REPORTAR_INCIDENTE,
};

const _crearUbicacion = (latitud: unknown, longitud: unknown, direccion = '', barrio = '') => {
  if (typeof latitud !== 'number' || typeof longitud !== 'number') {
    throw new BadRequestError('La latitud y la longitud son obligatorias y deben ser números');
  }
  try {
    return new Ubicacion(latitud, longitud, direccion, barrio);
  } catch (e) {
    throw new BadRequestError((e as Error).message);
  }
};

// ─── queries ─────────────────────────────────────────────────────────────────

const getIncidentes = async (estado?: string) => {
  if (estado) {
    try {
      EstadoIncidente.desdeNombre(estado);
    } catch {
      throw new BadRequestError(`Estado inválido: ${estado}`);
    }
  }
  return (await incidenteRepo.getAll({ estado })).map(formatearIncidente);
};

const getIncidenteById = async (id: unknown) => formatearIncidente(await _buscarIncidente(validarId(id, 'El id')));

// ─── reportar ────────────────────────────────────────────────────────────────

/** El reportante es el usuario del token. */
const reportarIncidente = async (data: PedidoReporte, username: string) => {
  const { tipoIncidenteId, descripcion, latitud, longitud, direccion, barrio } = data;

  if (!descripcion?.trim()) throw new BadRequestError('La descripción es obligatoria');

  const ubicacion = _crearUbicacion(latitud, longitud, direccion, barrio);
  const tipo = await tipoIncidenteRepo.getById(validarId(tipoIncidenteId, 'El tipoIncidenteId'));
  if (!tipo) throw new NotFoundError('Tipo de incidente no encontrado');
  const vecino = await _buscarVecino(username);
  if (!vecino.usuario.tenesPermiso(Permiso.REPORTAR_INCIDENTE)) {
    throw new ForbiddenError('Tu rol no puede reportar incidentes');
  }

  const incidente = Incidente.reportar(tipo, descripcion, ubicacion, vecino, obtenerReloj().ahora());
  await incidenteRepo.save(incidente);
  return formatearIncidente(incidente);
};

// ─── cambios de estado ───────────────────────────────────────────────────────

/**
 * Una sola entrada para todas las transiciones. El servicio controla que el rol del usuario del
 * token tenga el permiso de la acción (403), busca lo que necesita cada una y delega en el
 * incidente, que decide si es válida (409 si el estado no la admite, 422 si se viola una regla).
 */
const cambiarEstado = async (id: unknown, data: PedidoCambioDeEstado, username: string) => {
  const { accion, motivo = '', cuadrillaId, originalId, evidencia } = data;

  if (!Object.values<string>(Accion).includes(accion ?? '')) {
    throw new BadRequestError(`La acción debe ser una de: ${Object.values(Accion).join(', ')}`);
  }

  const incidente = await _buscarIncidente(validarId(id, 'El id'));
  const usuario = await _buscarUsuario(username);
  if (!usuario.tenesPermiso(PERMISO_POR_ACCION[accion as Accion])) {
    throw new ForbiddenError(`Tu rol no puede ${VERBOS[accion as Accion]} incidentes`);
  }
  const ahora = obtenerReloj().ahora();

  switch (accion as Accion) {
    case Accion.VALIDAR:
      incidente.validar(usuario, ahora);
      break;
    case Accion.RECHAZAR:
      incidente.rechazar(usuario, motivo, ahora);
      break;
    case Accion.MARCAR_DUPLICADO:
      incidente.marcarDuplicadoDe(await _buscarIncidente(validarId(originalId, 'El originalId')), usuario, ahora);
      break;
    case Accion.ASIGNAR: {
      const cuadrilla = await cuadrillaRepo.getById(validarId(cuadrillaId, 'El cuadrillaId'));
      if (!cuadrilla) throw new NotFoundError('Cuadrilla no encontrada');
      incidente.asignar(cuadrilla, usuario, ahora);
      break;
    }
    case Accion.INICIAR_TRABAJO:
      incidente.iniciarTrabajo(usuario, ahora);
      break;
    case Accion.RESOLVER:
      incidente.resolver(
        usuario,
        evidencia?.rutaFoto ? new Evidencia(evidencia.rutaFoto, evidencia.nota ?? null, usuario, ahora) : null,
        ahora,
      );
      break;
    case Accion.REABRIR:
      incidente.reabrir(await _buscarVecino(username), motivo, ahora);
      break;
    case Accion.CERRAR:
      incidente.cerrar(usuario, ahora);
      break;
  }

  await incidenteRepo.save(incidente);
  return formatearIncidente(incidente);
};

export { getIncidentes, getIncidenteById, reportarIncidente, cambiarEstado };
