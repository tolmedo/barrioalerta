import { masHoras, type Reloj } from './reloj.js';

/** En la demo el reloj arranca congelado: a las 10:00 de hoy o en la fecha de RELOJ_INICIAL (ISO 8601). */
export function inicioDeDemo(): Date {
  if (process.env.RELOJ_INICIAL) {
    return new Date(process.env.RELOJ_INICIAL);
  }
  const hoy = new Date();
  hoy.setHours(10, 0, 0, 0);
  return hoy;
}

/**
 * Reloj congelado que solo avanza cuando se le pide. Hace que la demo sea determinística: el paso
 * del tiempo real durante la exposición no dispara escalamientos inesperados.
 *
 * Pendiente H3: endpoints PUT /api/demo/reloj y POST /api/demo/reinicios para el guion.
 */
export class RelojDeDemo implements Reloj {
  private actual: Date;

  constructor(inicial: Date) {
    this.actual = new Date(inicial);
  }

  ahora(): Date {
    return new Date(this.actual);
  }

  avanzarHoras(horas: number): void {
    if (horas < 0) {
      throw new Error('El reloj de demo no retrocede');
    }
    this.actual = masHoras(this.actual, horas);
  }

  reiniciar(inicial: Date): void {
    this.actual = new Date(inicial);
  }
}
