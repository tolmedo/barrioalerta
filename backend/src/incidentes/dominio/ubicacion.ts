const RADIO_TIERRA_METROS = 6_371_000;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** Value Object: no tiene identidad, se compara por valor y es inmutable. */
export class Ubicacion {
  constructor(
    readonly latitud: number,
    readonly longitud: number,
    readonly direccion = '',
    readonly barrio = '',
  ) {
    if (latitud < -90 || latitud > 90) {
      throw new Error(`Latitud fuera de rango: ${latitud}`);
    }
    if (longitud < -180 || longitud > 180) {
      throw new Error(`Longitud fuera de rango: ${longitud}`);
    }
  }

  /** Distancia sobre la superficie terrestre (fórmula de Haversine). */
  distanciaMetrosA(otra: Ubicacion): number {
    const deltaLatitud = aRadianes(otra.latitud - this.latitud);
    const deltaLongitud = aRadianes(otra.longitud - this.longitud);
    const a =
      Math.sin(deltaLatitud / 2) ** 2 +
      Math.cos(aRadianes(this.latitud)) * Math.cos(aRadianes(otra.latitud)) * Math.sin(deltaLongitud / 2) ** 2;
    return RADIO_TIERRA_METROS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
