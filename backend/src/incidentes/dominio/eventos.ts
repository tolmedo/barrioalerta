import type { Usuario } from '../../identidad/dominio/usuario.js';
import type { NombreEstado } from './estados.js';
import type { Incidente } from './incidente.js';
import type { Vecino } from './vecino.js';

/**
 * Algo relevante que le pasó a un incidente. El agregado los acumula y el servicio de aplicación
 * los publica después de guardar (Observer → suscripción a eventos, C10). Así el dominio no conoce
 * a quienes reaccionan (notificaciones, recálculo de prioridad).
 *
 * Se referencia al incidente (y no solo a su id) porque los eventos se crean antes de persistir,
 * cuando el id todavía no existe. El campo `tipo` permite distinguirlos con un switch.
 */
export type EventoDominio = IncidenteReportado | EstadoIncidenteCambiado | AdhesionRegistrada | IncidenteEscalado;

interface EventoBase {
  readonly incidente: Incidente;
  readonly ocurridoEn: Date;
}

export interface IncidenteReportado extends EventoBase {
  readonly tipo: 'IncidenteReportado';
}

export interface EstadoIncidenteCambiado extends EventoBase {
  readonly tipo: 'EstadoIncidenteCambiado';
  readonly estadoAnterior: NombreEstado;
  readonly estadoNuevo: NombreEstado;
  readonly actor: Usuario;
}

export interface AdhesionRegistrada extends EventoBase {
  readonly tipo: 'AdhesionRegistrada';
  readonly vecino: Vecino;
}

export interface IncidenteEscalado extends EventoBase {
  readonly tipo: 'IncidenteEscalado';
  readonly nivel: number;
}
