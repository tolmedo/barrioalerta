package ar.utn.barrioalerta.incidentes.dominio;

import java.util.EnumSet;
import java.util.Set;

/** Estado final: el municipio determinó que no corresponde atenderlo (con motivo). */
public final class Rechazado implements EstadoIncidente {

    public static final String NOMBRE = "RECHAZADO";
    public static final Rechazado INSTANCIA = new Rechazado();

    private Rechazado() {
    }

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public Set<Accion> accionesPermitidas() {
        return EnumSet.noneOf(Accion.class);
    }
}
