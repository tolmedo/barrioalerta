package ar.utn.barrioalerta.incidentes.dominio;

import java.util.EnumSet;
import java.util.Set;

/** Estado final: es el mismo problema que otro incidente, que queda como el original. */
public final class Duplicado implements EstadoIncidente {

    public static final String NOMBRE = "DUPLICADO";
    public static final Duplicado INSTANCIA = new Duplicado();

    private Duplicado() {
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
