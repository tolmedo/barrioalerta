package ar.utn.barrioalerta.demo;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

/**
 * Reloj congelado que solo avanza cuando se le pide. Hace que la demo sea determinística: el paso
 * del tiempo real durante la exposición no dispara escalamientos inesperados (D10 del lineamiento).
 */
public class RelojDeDemo extends Clock {

    private final ZoneId zona;
    private volatile Instant actual;

    public RelojDeDemo(Instant inicial, ZoneId zona) {
        this.actual = inicial;
        this.zona = zona;
    }

    public synchronized void avanzar(Duration duracion) {
        if (duracion.isNegative()) {
            throw new IllegalArgumentException("El reloj de demo no retrocede");
        }
        actual = actual.plus(duracion);
    }

    public synchronized void reiniciar(Instant inicial) {
        actual = inicial;
    }

    @Override
    public Instant instant() {
        return actual;
    }

    @Override
    public ZoneId getZone() {
        return zona;
    }

    @Override
    public Clock withZone(ZoneId otraZona) {
        return new RelojDeDemo(actual, otraZona);
    }
}
