/**
 * Todo el código que necesita "la hora actual" recibe un Reloj (inversión de dependencias, C07).
 * En producción es el reloj del sistema; en la demo, un RelojDeDemo que solo avanza cuando se le
 * pide; en los tests de dominio se pasan fechas fijas.
 */
export interface Reloj {
  ahora(): Date;
}

export class RelojDelSistema implements Reloj {
  ahora(): Date {
    return new Date();
  }
}

let relojActual: Reloj = new RelojDelSistema();

/** Reloj que usan los servicios. server.ts lo cambia por un RelojDeDemo en modo demo, y los tests por uno fijo. */
export function obtenerReloj(): Reloj {
  return relojActual;
}

export function configurarReloj(reloj: Reloj): void {
  relojActual = reloj;
}

const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

export function masHoras(fecha: Date, horas: number): Date {
  return new Date(fecha.getTime() + horas * MILISEGUNDOS_POR_HORA);
}

export function masDias(fecha: Date, dias: number): Date {
  return masHoras(fecha, dias * 24);
}
