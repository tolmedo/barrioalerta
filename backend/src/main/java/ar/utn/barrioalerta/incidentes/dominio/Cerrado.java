package ar.utn.barrioalerta.incidentes.dominio;

import java.util.EnumSet;
import java.util.Set;

/** Estado final: resolución confirmada por el vecino o cerrada automáticamente. */
public final class Cerrado implements EstadoIncidente {

    public static final String NOMBRE = "CERRADO";
    public static final Cerrado INSTANCIA = new Cerrado();

    private Cerrado() {
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
