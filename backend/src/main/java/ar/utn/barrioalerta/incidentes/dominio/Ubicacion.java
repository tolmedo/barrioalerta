package ar.utn.barrioalerta.incidentes.dominio;

/**
 * Value Object: no tiene identidad, se compara por valor y es inmutable. En JPA se mapea como
 * {@code @Embeddable} (apunte ORM, "embeber una clase").
 */
public record Ubicacion(double latitud, double longitud, String direccion, String barrio) {

    private static final double RADIO_TIERRA_METROS = 6_371_000;

    public Ubicacion {
        if (latitud < -90 || latitud > 90) {
            throw new IllegalArgumentException("Latitud fuera de rango: " + latitud);
        }
        if (longitud < -180 || longitud > 180) {
            throw new IllegalArgumentException("Longitud fuera de rango: " + longitud);
        }
    }

    /** Distancia sobre la superficie terrestre (fórmula de Haversine). */
    public double distanciaMetrosA(Ubicacion otra) {
        double deltaLatitud = Math.toRadians(otra.latitud - latitud);
        double deltaLongitud = Math.toRadians(otra.longitud - longitud);
        double a = Math.pow(Math.sin(deltaLatitud / 2), 2)
                + Math.cos(Math.toRadians(latitud)) * Math.cos(Math.toRadians(otra.latitud))
                * Math.pow(Math.sin(deltaLongitud / 2), 2);
        return RADIO_TIERRA_METROS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
