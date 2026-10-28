import { ConflictoDeEstadoError, ReglaDeNegocioError } from '../../compartido/dominio/errores.js';
import { masDias } from '../../compartido/dominio/tiempo.js';
import type { Usuario } from '../../identidad/dominio/usuario.js';
import { Accion, VERBOS } from './accion.js';
import type { Cuadrilla } from './cuadrilla.js';
import type { Incidente } from './incidente.js';
import type { Evidencia } from './registros.js';
import type { Vecino } from './vecino.js';

export type NombreEstado =
  | 'REPORTADO'
  | 'VALIDADO'
  | 'ASIGNADO'
  | 'EN_CURSO'
  | 'RESUELTO'
  | 'CERRADO'
  | 'RECHAZADO'
  | 'DUPLICADO';

export class TransicionInvalidaError extends ConflictoDeEstadoError {
  constructor(estado: NombreEstado, accion: Accion) {
    super(`No se puede ${VERBOS[accion]} un incidente en estado ${estado}`);
  }
}

/**
 * Patrón State (C03 · Patrón State). Cada estado concreto redefine solo las transiciones válidas
 * desde él; el resto conserva el comportamiento por defecto, que rechaza la acción.
 *
 * El propio estado decide cuál es el siguiente, pero siempre a través de Incidente.cambiarEstado(),
 * que es el único punto que registra la auditoría.
 *
 * Los estados no tienen atributos (stateless, C06): existe una única instancia de cada uno y se
 * persisten por nombre. Están todos en este archivo para evitar importaciones circulares.
 */
export abstract class EstadoIncidente {
  abstract readonly nombre: NombreEstado;

  abstract accionesPermitidas(): ReadonlySet<Accion>;

  admiteAdhesiones(): boolean {
    return false;
  }

  /** Si el SLA del incidente corre en este estado (y por lo tanto puede escalar). */
  cuentaParaSla(): boolean {
    return false;
  }

  validar(incidente: Incidente, operador: Usuario, ahora: Date): void {
    throw this.transicionInvalida(Accion.VALIDAR);
  }

  rechazar(incidente: Incidente, operador: Usuario, motivo: string, ahora: Date): void {
    throw this.transicionInvalida(Accion.RECHAZAR);
  }

  marcarDuplicadoDe(incidente: Incidente, original: Incidente, operador: Usuario, ahora: Date): void {
    throw this.transicionInvalida(Accion.MARCAR_DUPLICADO);
  }

  asignar(incidente: Incidente, cuadrilla: Cuadrilla, operador: Usuario, ahora: Date): void {
    throw this.transicionInvalida(Accion.ASIGNAR);
  }

  iniciarTrabajo(incidente: Incidente, miembro: Usuario, ahora: Date): void {
    throw this.transicionInvalida(Accion.INICIAR_TRABAJO);
  }

  resolver(incidente: Incidente, evidencia: Evidencia, miembro: Usuario, ahora: Date): void {
    throw this.transicionInvalida(Accion.RESOLVER);
  }

  reabrir(incidente: Incidente, vecino: Vecino, motivo: string, ahora: Date): void {
    throw this.transicionInvalida(Accion.REABRIR);
  }

  cerrar(incidente: Incidente, actor: Usuario, ahora: Date): void {
    throw this.transicionInvalida(Accion.CERRAR);
  }

  private transicionInvalida(accion: Accion): TransicionInvalidaError {
    return new TransicionInvalidaError(this.nombre, accion);
  }

  /** Reconstruye el estado a partir del nombre persistido. Es el único lugar con un switch por estado. */
  static desdeNombre(nombre: string): EstadoIncidente {
    switch (nombre) {
      case 'REPORTADO':
        return Reportado.INSTANCIA;
      case 'VALIDADO':
        return Validado.INSTANCIA;
      case 'ASIGNADO':
        return Asignado.INSTANCIA;
      case 'EN_CURSO':
        return EnCurso.INSTANCIA;
      case 'RESUELTO':
        return Resuelto.INSTANCIA;
      case 'CERRADO':
        return Cerrado.INSTANCIA;
      case 'RECHAZADO':
        return Rechazado.INSTANCIA;
      case 'DUPLICADO':
        return Duplicado.INSTANCIA;
      default:
        throw new Error(`Estado de incidente desconocido: ${nombre}`);
    }
  }
}

const NINGUNA: ReadonlySet<Accion> = new Set();

/** Recién reportado por un vecino; espera que un operador lo valide, rechace o marque duplicado. */
export class Reportado extends EstadoIncidente {
  static readonly INSTANCIA = new Reportado();
  private static readonly ACCIONES: ReadonlySet<Accion> = new Set([
    Accion.VALIDAR,
    Accion.RECHAZAR,
    Accion.MARCAR_DUPLICADO,
  ]);
  readonly nombre = 'REPORTADO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return Reportado.ACCIONES;
  }

  override admiteAdhesiones(): boolean {
    return true;
  }

  override validar(incidente: Incidente, operador: Usuario, ahora: Date): void {
    incidente.cambiarEstado(Validado.INSTANCIA, operador, null, ahora);
  }

  override rechazar(incidente: Incidente, operador: Usuario, motivo: string, ahora: Date): void {
    incidente.cambiarEstado(Rechazado.INSTANCIA, operador, motivo, ahora);
  }

  override marcarDuplicadoDe(incidente: Incidente, original: Incidente, operador: Usuario, ahora: Date): void {
    incidente.registrarOriginal(original);
    incidente.cambiarEstado(Duplicado.INSTANCIA, operador, 'Duplicado de otro incidente', ahora);
  }
}

/** Confirmado por el municipio; espera que se le asigne una cuadrilla. */
export class Validado extends EstadoIncidente {
  static readonly INSTANCIA = new Validado();
  private static readonly ACCIONES: ReadonlySet<Accion> = new Set([Accion.ASIGNAR]);
  readonly nombre = 'VALIDADO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return Validado.ACCIONES;
  }

  override admiteAdhesiones(): boolean {
    return true;
  }

  override cuentaParaSla(): boolean {
    return true;
  }

  override asignar(incidente: Incidente, cuadrilla: Cuadrilla, operador: Usuario, ahora: Date): void {
    incidente.asignarCuadrilla(cuadrilla);
    incidente.cambiarEstado(Asignado.INSTANCIA, operador, `Asignado a ${cuadrilla.nombre}`, ahora);
  }
}

/** Tiene cuadrilla asignada; puede reasignarse o empezar a trabajarse. */
export class Asignado extends EstadoIncidente {
  static readonly INSTANCIA = new Asignado();
  private static readonly ACCIONES: ReadonlySet<Accion> = new Set([Accion.ASIGNAR, Accion.INICIAR_TRABAJO]);
  readonly nombre = 'ASIGNADO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return Asignado.ACCIONES;
  }

  override admiteAdhesiones(): boolean {
    return true;
  }

  override cuentaParaSla(): boolean {
    return true;
  }

  /** Reasignación: transición a sí mismo, que igual queda auditada. */
  override asignar(incidente: Incidente, cuadrilla: Cuadrilla, operador: Usuario, ahora: Date): void {
    incidente.asignarCuadrilla(cuadrilla);
    incidente.cambiarEstado(Asignado.INSTANCIA, operador, `Reasignado a ${cuadrilla.nombre}`, ahora);
  }

  override iniciarTrabajo(incidente: Incidente, miembro: Usuario, ahora: Date): void {
    incidente.verificarMiembroDeCuadrillaAsignada(miembro);
    incidente.cambiarEstado(EnCurso.INSTANCIA, miembro, null, ahora);
  }
}

/** La cuadrilla está trabajando; solo puede resolverse con evidencia. */
export class EnCurso extends EstadoIncidente {
  static readonly INSTANCIA = new EnCurso();
  private static readonly ACCIONES: ReadonlySet<Accion> = new Set([Accion.RESOLVER]);
  readonly nombre = 'EN_CURSO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return EnCurso.ACCIONES;
  }

  override admiteAdhesiones(): boolean {
    return true;
  }

  override cuentaParaSla(): boolean {
    return true;
  }

  override resolver(incidente: Incidente, evidencia: Evidencia, miembro: Usuario, ahora: Date): void {
    incidente.verificarMiembroDeCuadrillaAsignada(miembro);
    incidente.agregarEvidencia(evidencia);
    incidente.cambiarEstado(Resuelto.INSTANCIA, miembro, evidencia.nota, ahora);
  }
}

/** La cuadrilla lo resolvió; el vecino confirma (o se cierra solo) o lo reabre. */
export class Resuelto extends EstadoIncidente {
  static readonly INSTANCIA = new Resuelto();
  /** Plazo que tiene el vecino para reabrir un incidente resuelto. */
  static readonly DIAS_PARA_REABRIR = 7;
  private static readonly ACCIONES: ReadonlySet<Accion> = new Set([Accion.CERRAR, Accion.REABRIR]);
  readonly nombre = 'RESUELTO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return Resuelto.ACCIONES;
  }

  override cerrar(incidente: Incidente, actor: Usuario, ahora: Date): void {
    incidente.cambiarEstado(Cerrado.INSTANCIA, actor, null, ahora);
  }

  override reabrir(incidente: Incidente, vecino: Vecino, motivo: string, ahora: Date): void {
    const limite = masDias(incidente.fechaUltimoCambio(), Resuelto.DIAS_PARA_REABRIR);
    if (ahora > limite) {
      throw new ReglaDeNegocioError(`Pasó el plazo de ${Resuelto.DIAS_PARA_REABRIR} días para reabrir el incidente`);
    }
    incidente.liberarCuadrilla();
    incidente.cambiarEstado(Validado.INSTANCIA, vecino.usuario, motivo, ahora);
  }
}

/** Estado final: resolución confirmada por el vecino o cerrada automáticamente. */
export class Cerrado extends EstadoIncidente {
  static readonly INSTANCIA = new Cerrado();
  readonly nombre = 'CERRADO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return NINGUNA;
  }
}

/** Estado final: el municipio determinó que no corresponde atenderlo (con motivo). */
export class Rechazado extends EstadoIncidente {
  static readonly INSTANCIA = new Rechazado();
  readonly nombre = 'RECHAZADO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return NINGUNA;
  }
}

/** Estado final: es el mismo problema que otro incidente, que queda como el original. */
export class Duplicado extends EstadoIncidente {
  static readonly INSTANCIA = new Duplicado();
  readonly nombre = 'DUPLICADO';

  private constructor() {
    super();
  }

  accionesPermitidas(): ReadonlySet<Accion> {
    return NINGUNA;
  }
}
