import { ReglaDeNegocioError } from '../../compartido/dominio/errores.js';
import { masHoras } from '../../compartido/dominio/tiempo.js';
import type { Usuario } from '../../identidad/dominio/usuario.js';
import type { Accion } from './accion.js';
import type { Cuadrilla } from './cuadrilla.js';
import { type EstadoIncidente, Reportado } from './estados.js';
import type { EventoDominio } from './eventos.js';
import type { Adhesion, CambioDeEstado, Evidencia } from './registros.js';
import type { TipoIncidente } from './tipoIncidente.js';
import type { Ubicacion } from './ubicacion.js';
import type { Vecino } from './vecino.js';

/**
 * Raíz del agregado. Encapsula las reglas del ciclo de vida (modelo de dominio rico): los servicios
 * de aplicación solo cargan el incidente, invocan uno de estos métodos, lo guardan y publican los
 * eventos que devuelve extraerEventos().
 *
 * La hora actual llega como parámetro (`ahora`): la obtiene el servicio de un Reloj inyectado,
 * porque las entidades no reciben inyección de dependencias.
 */
export class Incidente {
  private _id: number | undefined;
  private readonly _descripcion: string;
  private readonly _vencimientoSla: Date;
  private _estado: EstadoIncidente;
  private _cuadrillaAsignada: Cuadrilla | null = null;
  private _original: Incidente | null = null;
  private _nivelEscalamiento = 0;
  private readonly _historial: CambioDeEstado[] = [];
  private readonly _adhesiones: Adhesion[] = [];
  private readonly _evidencias: Evidencia[] = [];
  private _eventos: EventoDominio[] = [];

  private constructor(
    readonly tipo: TipoIncidente,
    descripcion: string,
    readonly ubicacion: Ubicacion,
    readonly reportante: Vecino,
    readonly fechaReporte: Date,
  ) {
    this._descripcion = descripcion.trim();
    this._vencimientoSla = masHoras(fechaReporte, tipo.slaHoras);
    this._estado = Reportado.INSTANCIA;
    this._historial.push({
      estadoAnterior: null,
      estadoNuevo: Reportado.INSTANCIA.nombre,
      actor: reportante.usuario,
      fecha: fechaReporte,
      motivo: null,
    });
    this._eventos.push({ tipo: 'IncidenteReportado', incidente: this, ocurridoEn: fechaReporte });
  }

  static reportar(
    tipo: TipoIncidente,
    descripcion: string,
    ubicacion: Ubicacion,
    reportante: Vecino,
    ahora: Date,
  ): Incidente {
    return new Incidente(tipo, descripcion, ubicacion, reportante, ahora);
  }

  // ---------------------------------------------------------------- comportamiento de negocio

  adherir(vecino: Vecino, ahora: Date): void {
    if (!this._estado.admiteAdhesiones()) {
      throw new ReglaDeNegocioError(`Un incidente en estado ${this._estado.nombre} no admite adhesiones`);
    }
    if (this.esReportante(vecino.usuario)) {
      throw new ReglaDeNegocioError('Quien reportó el incidente no puede adherir a él');
    }
    if (this._adhesiones.some((adhesion) => adhesion.vecino.usuario.esIgualA(vecino.usuario))) {
      throw new ReglaDeNegocioError('El vecino ya adhirió a este incidente');
    }
    this._adhesiones.push({ vecino, fecha: ahora });
    this._eventos.push({ tipo: 'AdhesionRegistrada', incidente: this, vecino, ocurridoEn: ahora });
  }

  validar(operador: Usuario, ahora: Date): void {
    this._estado.validar(this, operador, ahora);
  }

  rechazar(operador: Usuario, motivo: string, ahora: Date): void {
    exigirMotivo(motivo);
    this._estado.rechazar(this, operador, motivo, ahora);
  }

  marcarDuplicadoDe(original: Incidente, operador: Usuario, ahora: Date): void {
    if (original === this) {
      throw new ReglaDeNegocioError('Un incidente no puede ser duplicado de sí mismo');
    }
    if (!original.tipo.esIgualA(this.tipo)) {
      throw new ReglaDeNegocioError('El incidente original debe ser del mismo tipo');
    }
    this._estado.marcarDuplicadoDe(this, original, operador, ahora);
  }

  asignar(cuadrilla: Cuadrilla, operador: Usuario, ahora: Date): void {
    if (!cuadrilla.puedeAtender(this.tipo)) {
      throw new ReglaDeNegocioError(`La cuadrilla ${cuadrilla.nombre} no tiene la especialidad ${this.tipo.nombre}`);
    }
    this._estado.asignar(this, cuadrilla, operador, ahora);
  }

  iniciarTrabajo(miembro: Usuario, ahora: Date): void {
    this._estado.iniciarTrabajo(this, miembro, ahora);
  }

  resolver(miembro: Usuario, evidencia: Evidencia | null, ahora: Date): void {
    if (!evidencia) {
      throw new ReglaDeNegocioError('Para resolver un incidente hace falta una foto de evidencia');
    }
    this._estado.resolver(this, evidencia, miembro, ahora);
  }

  reabrir(vecino: Vecino, motivo: string, ahora: Date): void {
    if (!this.esReportante(vecino.usuario)) {
      throw new ReglaDeNegocioError('Solo quien reportó el incidente puede reabrirlo');
    }
    exigirMotivo(motivo);
    this._estado.reabrir(this, vecino, motivo, ahora);
  }

  /** Lo cierra el vecino que reportó, confirmando la resolución. */
  cerrar(actor: Usuario, ahora: Date): void {
    if (!this.esReportante(actor)) {
      throw new ReglaDeNegocioError('Solo quien reportó el incidente puede cerrarlo');
    }
    this._estado.cerrar(this, actor, ahora);
  }

  estaVencido(ahora: Date): boolean {
    return this._estado.cuentaParaSla() && ahora >= this._vencimientoSla;
  }

  /**
   * Escala como máximo una vez por período de SLA: con un SLA de 48 h, el nivel 1 llega a las 48 h
   * del reporte, el nivel 2 a las 96 h, etc. El escalamiento no es un estado porque no cambia el
   * comportamiento del incidente (C13: no usar State si el comportamiento no varía).
   */
  debeEscalar(ahora: Date): boolean {
    const proximoEscalamiento = masHoras(this._vencimientoSla, this.tipo.slaHoras * this._nivelEscalamiento);
    return this._estado.cuentaParaSla() && ahora >= proximoEscalamiento;
  }

  escalar(ahora: Date): void {
    if (!this.debeEscalar(ahora)) {
      throw new ReglaDeNegocioError('El incidente no está en condiciones de escalar');
    }
    this._nivelEscalamiento++;
    this._eventos.push({ tipo: 'IncidenteEscalado', incidente: this, nivel: this._nivelEscalamiento, ocurridoEn: ahora });
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return this._estado.accionesPermitidas();
  }

  /** Devuelve los eventos ocurridos desde la última extracción, para publicarlos después de guardar. */
  extraerEventos(): EventoDominio[] {
    const pendientes = this._eventos;
    this._eventos = [];
    return pendientes;
  }

  esReportante(usuario: Usuario): boolean {
    return this.reportante.usuario.esIgualA(usuario);
  }

  // ------------------------------------------------- uso exclusivo de los estados (EstadoIncidente)

  /** Único punto de cambio de estado: garantiza que toda transición quede auditada y publicada. */
  cambiarEstado(nuevo: EstadoIncidente, actor: Usuario, motivo: string | null, ahora: Date): void {
    const anterior = this._estado;
    this._estado = nuevo;
    this._historial.push({ estadoAnterior: anterior.nombre, estadoNuevo: nuevo.nombre, actor, fecha: ahora, motivo });
    this._eventos.push({
      tipo: 'EstadoIncidenteCambiado',
      incidente: this,
      estadoAnterior: anterior.nombre,
      estadoNuevo: nuevo.nombre,
      actor,
      ocurridoEn: ahora,
    });
  }

  asignarCuadrilla(cuadrilla: Cuadrilla): void {
    this._cuadrillaAsignada = cuadrilla;
  }

  liberarCuadrilla(): void {
    this._cuadrillaAsignada = null;
  }

  registrarOriginal(original: Incidente): void {
    this._original = original;
  }

  agregarEvidencia(evidencia: Evidencia): void {
    this._evidencias.push(evidencia);
  }

  verificarMiembroDeCuadrillaAsignada(usuario: Usuario): void {
    if (!this._cuadrillaAsignada?.tieneMiembro(usuario)) {
      throw new ReglaDeNegocioError(`${usuario} no pertenece a la cuadrilla asignada`);
    }
  }

  fechaUltimoCambio(): Date {
    return this._historial[this._historial.length - 1]!.fecha;
  }

  // ---------------------------------------------------------------- consultas

  get id(): number | undefined {
    return this._id;
  }

  get descripcion(): string {
    return this._descripcion;
  }

  get vencimientoSla(): Date {
    return this._vencimientoSla;
  }

  get estado(): EstadoIncidente {
    return this._estado;
  }

  get cuadrillaAsignada(): Cuadrilla | null {
    return this._cuadrillaAsignada;
  }

  get original(): Incidente | null {
    return this._original;
  }

  get nivelEscalamiento(): number {
    return this._nivelEscalamiento;
  }

  get historial(): readonly CambioDeEstado[] {
    return [...this._historial];
  }

  get adhesiones(): readonly Adhesion[] {
    return [...this._adhesiones];
  }

  get cantidadAdhesiones(): number {
    return this._adhesiones.length;
  }

  get evidencias(): readonly Evidencia[] {
    return [...this._evidencias];
  }
}

function exigirMotivo(motivo: string): void {
  if (!motivo.trim()) {
    throw new ReglaDeNegocioError('El motivo es obligatorio');
  }
}
