package ar.utn.barrioalerta.incidentes.dominio;

/**
 * Puerto saliente (C06 · Interfaces entrantes y salientes): el dominio define qué necesita y el
 * módulo {@code geo} provee los adaptadores (Georef online y uno offline para la demo).
 */
public interface Geocodificador {

    /** Completa dirección aproximada y barrio a partir de las coordenadas. */
    Ubicacion resolver(double latitud, double longitud);
}
