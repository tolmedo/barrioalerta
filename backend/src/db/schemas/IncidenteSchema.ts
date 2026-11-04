import { EntitySchema } from 'typeorm';
import type { CuadrillaFila } from './CuadrillaSchema.js';
import type { TipoIncidenteFila } from './TipoIncidenteSchema.js';
import type { UsuarioFila } from './UsuarioSchema.js';
import type { VecinoFila } from './VecinoSchema.js';

export interface IncidenteFila {
  id: number;
  tipo: TipoIncidenteFila;
  reportante: VecinoFila;
  cuadrillaAsignada: CuadrillaFila | null;
  originalId: number | null;
  descripcion: string;
  latitud: number;
  longitud: number;
  direccion: string;
  barrio: string;
  fechaReporte: Date;
  vencimientoSla: Date;
  estado: string;
  nivelEscalamiento: number;
  cantidadAdhesiones: number;
  historial: CambioDeEstadoFila[];
  adhesiones: AdhesionFila[];
  evidencias: EvidenciaFila[];
}

export interface CambioDeEstadoFila {
  id: number;
  incidente?: IncidenteFila;
  estadoAnterior: string | null;
  estadoNuevo: string;
  actor: UsuarioFila;
  fecha: Date;
  motivo: string | null;
  orden: number;
}

export interface AdhesionFila {
  incidenteId: number;
  vecinoId: number;
  incidente?: IncidenteFila;
  vecino: VecinoFila;
  fecha: Date;
}

export interface EvidenciaFila {
  id: number;
  incidente?: IncidenteFila;
  rutaFoto: string;
  nota: string | null;
  autor: UsuarioFila;
  fecha: Date;
}

/**
 * - `estado` guarda el nombre del estado actual; al leer se rearma con EstadoIncidente.desdeNombre.
 * - `estado` y `cantidadAdhesiones` están desnormalizados: el mapa y la bandeja los leen sin
 *   recorrer el historial ni las adhesiones.
 * - La ubicación va embebida en columnas porque es un Value Object.
 */
export const IncidenteSchema = new EntitySchema<IncidenteFila>({
  name: 'Incidente',
  tableName: 'incidente',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    originalId: { name: 'original_id', type: 'int', nullable: true },
    descripcion: { type: 'text' },
    latitud: { type: 'double precision' },
    longitud: { type: 'double precision' },
    direccion: { type: 'varchar' },
    barrio: { type: 'varchar' },
    fechaReporte: { name: 'fecha_reporte', type: 'timestamptz' },
    vencimientoSla: { name: 'vencimiento_sla', type: 'timestamptz' },
    estado: { type: 'varchar' },
    nivelEscalamiento: { name: 'nivel_escalamiento', type: 'int' },
    cantidadAdhesiones: { name: 'cantidad_adhesiones', type: 'int' },
  },
  relations: {
    tipo: { type: 'many-to-one', target: 'TipoIncidente', joinColumn: { name: 'tipo_incidente_id' }, nullable: false },
    reportante: { type: 'many-to-one', target: 'Vecino', joinColumn: { name: 'reportante_id' }, nullable: false },
    cuadrillaAsignada: { type: 'many-to-one', target: 'Cuadrilla', joinColumn: { name: 'cuadrilla_asignada_id' }, nullable: true },
    historial: { type: 'one-to-many', target: 'CambioDeEstado', inverseSide: 'incidente' },
    adhesiones: { type: 'one-to-many', target: 'Adhesion', inverseSide: 'incidente' },
    evidencias: { type: 'one-to-many', target: 'Evidencia', inverseSide: 'incidente' },
  },
  foreignKeys: [{ target: 'Incidente', columnNames: ['originalId'], referencedColumnNames: ['id'] }],
  indices: [
    { columns: ['estado'] },
    { columns: ['latitud', 'longitud'] },
    { columns: ['tipo', 'estado'] },
  ],
});

/** `orden` conserva el orden de la lista historial. */
export const CambioDeEstadoSchema = new EntitySchema<CambioDeEstadoFila>({
  name: 'CambioDeEstado',
  tableName: 'cambio_de_estado',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    estadoAnterior: { name: 'estado_anterior', type: 'varchar', nullable: true },
    estadoNuevo: { name: 'estado_nuevo', type: 'varchar' },
    fecha: { type: 'timestamptz' },
    motivo: { type: 'text', nullable: true },
    orden: { type: 'int' },
  },
  relations: {
    incidente: { type: 'many-to-one', target: 'Incidente', joinColumn: { name: 'incidente_id' }, nullable: false, onDelete: 'CASCADE' },
    actor: { type: 'many-to-one', target: 'Usuario', joinColumn: { name: 'actor_id' }, nullable: false },
  },
  uniques: [{ columns: ['incidente', 'orden'] }],
});

/** La clave compuesta (incidente, vecino) hace que la base también impida adherir dos veces. */
export const AdhesionSchema = new EntitySchema<AdhesionFila>({
  name: 'Adhesion',
  tableName: 'adhesion',
  columns: {
    incidenteId: { name: 'incidente_id', type: 'int', primary: true },
    vecinoId: { name: 'vecino_id', type: 'int', primary: true },
    fecha: { type: 'timestamptz' },
  },
  relations: {
    incidente: { type: 'many-to-one', target: 'Incidente', joinColumn: { name: 'incidente_id' }, onDelete: 'CASCADE' },
    vecino: { type: 'many-to-one', target: 'Vecino', joinColumn: { name: 'vecino_id' } },
  },
});

export const EvidenciaSchema = new EntitySchema<EvidenciaFila>({
  name: 'Evidencia',
  tableName: 'evidencia',
  columns: {
    id: { type: 'int', primary: true, generated: 'increment' },
    rutaFoto: { name: 'ruta_foto', type: 'varchar' },
    nota: { type: 'text', nullable: true },
    fecha: { type: 'timestamptz' },
  },
  relations: {
    incidente: { type: 'many-to-one', target: 'Incidente', joinColumn: { name: 'incidente_id' }, nullable: false, onDelete: 'CASCADE' },
    autor: { type: 'many-to-one', target: 'Usuario', joinColumn: { name: 'autor_id' }, nullable: false },
  },
});
