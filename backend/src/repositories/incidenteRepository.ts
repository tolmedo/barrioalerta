import { AppDataSource } from '../db/connection.js';
import {
  AdhesionSchema,
  CambioDeEstadoSchema,
  EvidenciaSchema,
  type IncidenteFila,
  IncidenteSchema,
} from '../db/schemas/IncidenteSchema.js';
import { EstadoIncidente } from '../models/EstadoIncidente.js';
import { Incidente } from '../models/Incidente.js';
import { Evidencia } from '../models/RegistrosIncidente.js';
import { Ubicacion } from '../models/Ubicacion.js';
import { exigirId } from '../utils/persistenciaUtils.js';
import { aCuadrilla, RELACIONES_CUADRILLA } from './cuadrillaRepository.js';
import { aTipoIncidente } from './tipoIncidenteRepository.js';
import { aUsuario, RELACIONES_USUARIO } from './usuarioRepository.js';
import { aVecino, RELACIONES_VECINO } from './vecinoRepository.js';

const repo = () => AppDataSource.getRepository(IncidenteSchema);

const RELACIONES_INCIDENTE = {
  tipo: true,
  reportante: RELACIONES_VECINO,
  cuadrillaAsignada: RELACIONES_CUADRILLA,
  historial: { actor: RELACIONES_USUARIO },
  adhesiones: { vecino: RELACIONES_VECINO },
  evidencias: { autor: RELACIONES_USUARIO },
} as const;

const ORDEN_HISTORIAL = { historial: { orden: 'ASC' } } as const;

const aIncidente = async (fila: IncidenteFila): Promise<Incidente> =>
  Incidente.reconstituir({
    id: fila.id,
    tipo: aTipoIncidente(fila.tipo),
    descripcion: fila.descripcion,
    ubicacion: new Ubicacion(fila.latitud, fila.longitud, fila.direccion, fila.barrio),
    reportante: aVecino(fila.reportante),
    fechaReporte: fila.fechaReporte,
    vencimientoSla: fila.vencimientoSla,
    estado: EstadoIncidente.desdeNombre(fila.estado),
    cuadrillaAsignada: fila.cuadrillaAsignada ? aCuadrilla(fila.cuadrillaAsignada) : null,
    original: fila.originalId ? await getById(fila.originalId) : null,
    nivelEscalamiento: fila.nivelEscalamiento,
    historial: fila.historial.map((cambio) => ({
      estadoAnterior: cambio.estadoAnterior ? EstadoIncidente.desdeNombre(cambio.estadoAnterior).nombre : null,
      estadoNuevo: EstadoIncidente.desdeNombre(cambio.estadoNuevo).nombre,
      actor: aUsuario(cambio.actor),
      fecha: cambio.fecha,
      motivo: cambio.motivo,
    })),
    adhesiones: fila.adhesiones.map((adhesion) => ({ vecino: aVecino(adhesion.vecino), fecha: adhesion.fecha })),
    evidencias: fila.evidencias.map(
      (evidencia) => new Evidencia(evidencia.rutaFoto, evidencia.nota, aUsuario(evidencia.autor), evidencia.fecha),
    ),
  });

/** `estado` filtra por la columna desnormalizada, sin recorrer el historial. */
export const getAll = async (filtros: { estado?: string } = {}) =>
  Promise.all(
    (
      await repo().find({
        where: filtros.estado ? { estado: filtros.estado } : {},
        relations: RELACIONES_INCIDENTE,
        order: { id: 'ASC', ...ORDEN_HISTORIAL },
      })
    ).map(aIncidente),
  );

export async function getById(id: number): Promise<Incidente | null> {
  const fila = await repo().findOne({ where: { id }, relations: RELACIONES_INCIDENTE, order: ORDEN_HISTORIAL });
  return fila ? aIncidente(fila) : null;
}

/**
 * Guarda el agregado completo en una transacción. El historial, las adhesiones y las evidencias
 * solo crecen, así que se insertan únicamente las entradas que todavía no están en la base.
 */
export const save = async (incidente: Incidente): Promise<Incidente> => {
  const id = await AppDataSource.transaction(async (manager) => {
    const { id } = await manager.save(IncidenteSchema, {
      id: incidente.id,
      tipo: { id: exigirId(incidente.tipo, `El tipo ${incidente.tipo.nombre}`) },
      reportante: { id: exigirId(incidente.reportante, `El vecino ${incidente.reportante.nombre}`) },
      cuadrillaAsignada: incidente.cuadrillaAsignada
        ? { id: exigirId(incidente.cuadrillaAsignada, `La cuadrilla ${incidente.cuadrillaAsignada.nombre}`) }
        : null,
      originalId: incidente.original ? exigirId(incidente.original, 'El incidente original') : null,
      descripcion: incidente.descripcion,
      latitud: incidente.ubicacion.latitud,
      longitud: incidente.ubicacion.longitud,
      direccion: incidente.ubicacion.direccion,
      barrio: incidente.ubicacion.barrio,
      fechaReporte: incidente.fechaReporte,
      vencimientoSla: incidente.vencimientoSla,
      estado: incidente.estado.nombre,
      nivelEscalamiento: incidente.nivelEscalamiento,
      cantidadAdhesiones: incidente.cantidadAdhesiones,
    });

    const cambiosGuardados = await manager.countBy(CambioDeEstadoSchema, { incidente: { id } });
    const cambiosNuevos = incidente.historial.slice(cambiosGuardados).map((cambio, i) => ({
      incidente: { id },
      orden: cambiosGuardados + i,
      estadoAnterior: cambio.estadoAnterior,
      estadoNuevo: cambio.estadoNuevo,
      actor: { id: exigirId(cambio.actor, `El usuario ${cambio.actor.username}`) },
      fecha: cambio.fecha,
      motivo: cambio.motivo,
    }));
    if (cambiosNuevos.length > 0) {
      await manager.insert(CambioDeEstadoSchema, cambiosNuevos);
    }

    const adhesionesGuardadas = await manager.countBy(AdhesionSchema, { incidenteId: id });
    const adhesionesNuevas = incidente.adhesiones.slice(adhesionesGuardadas).map((adhesion) => ({
      incidenteId: id,
      vecinoId: exigirId(adhesion.vecino, `El vecino ${adhesion.vecino.nombre}`),
      fecha: adhesion.fecha,
    }));
    if (adhesionesNuevas.length > 0) {
      await manager.insert(AdhesionSchema, adhesionesNuevas);
    }

    const evidenciasGuardadas = await manager.countBy(EvidenciaSchema, { incidente: { id } });
    const evidenciasNuevas = incidente.evidencias.slice(evidenciasGuardadas).map((evidencia) => ({
      incidente: { id },
      rutaFoto: evidencia.rutaFoto,
      nota: evidencia.nota,
      autor: { id: exigirId(evidencia.autor, `El usuario ${evidencia.autor.username}`) },
      fecha: evidencia.fecha,
    }));
    if (evidenciasNuevas.length > 0) {
      await manager.insert(EvidenciaSchema, evidenciasNuevas);
    }

    return id;
  });

  if (incidente.id === undefined) {
    incidente.asignarId(id);
  }
  return incidente;
};
