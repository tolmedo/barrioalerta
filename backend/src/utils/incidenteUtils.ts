import type { Cuadrilla } from '../models/Cuadrilla.js';
import type { Incidente } from '../models/Incidente.js';
import type { TipoIncidente } from '../models/TipoIncidente.js';
import type { Ubicacion } from '../models/Ubicacion.js';

// Arman las respuestas de la API con datos planos: los modelos tienen campos privados y referencias
// a otros objetos que no se deben mandar tal cual.

const formatearUbicacion = (ubicacion: Ubicacion) => ({
  latitud: ubicacion.latitud,
  longitud: ubicacion.longitud,
  direccion: ubicacion.direccion,
  barrio: ubicacion.barrio,
});

export const formatearTipo = (tipo: TipoIncidente) => ({
  id: tipo.id,
  nombre: tipo.nombre,
  slaHoras: tipo.slaHoras,
});

export const formatearCuadrilla = (cuadrilla: Cuadrilla) => ({
  id: cuadrilla.id,
  nombre: cuadrilla.nombre,
  base: formatearUbicacion(cuadrilla.base),
  especialidades: cuadrilla.especialidades.map(formatearTipo),
  miembros: cuadrilla.miembros.map((miembro) => miembro.username),
});

/** Incluye las acciones permitidas para que el front muestre solo los botones válidos. */
export const formatearIncidente = (incidente: Incidente) => ({
  id: incidente.id,
  tipo: formatearTipo(incidente.tipo),
  descripcion: incidente.descripcion,
  ubicacion: formatearUbicacion(incidente.ubicacion),
  reportante: {
    id: incidente.reportante.id,
    nombre: incidente.reportante.nombre,
    username: incidente.reportante.usuario.username,
  },
  estado: incidente.estado.nombre,
  accionesPermitidas: [...incidente.accionesPermitidas()],
  cuadrillaAsignada: incidente.cuadrillaAsignada
    ? { id: incidente.cuadrillaAsignada.id, nombre: incidente.cuadrillaAsignada.nombre }
    : null,
  originalId: incidente.original?.id ?? null,
  fechaReporte: incidente.fechaReporte,
  vencimientoSla: incidente.vencimientoSla,
  nivelEscalamiento: incidente.nivelEscalamiento,
  cantidadAdhesiones: incidente.cantidadAdhesiones,
  historial: incidente.historial.map((cambio) => ({
    estadoAnterior: cambio.estadoAnterior,
    estadoNuevo: cambio.estadoNuevo,
    actor: cambio.actor.username,
    fecha: cambio.fecha,
    motivo: cambio.motivo,
  })),
  evidencias: incidente.evidencias.map((evidencia) => ({
    rutaFoto: evidencia.rutaFoto,
    nota: evidencia.nota,
    autor: evidencia.autor.username,
    fecha: evidencia.fecha,
  })),
});
