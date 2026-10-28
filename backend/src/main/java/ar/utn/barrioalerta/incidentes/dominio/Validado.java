package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

/** Confirmado por el municipio; espera que se le asigne una cuadrilla. */
public final class Validado implements EstadoIncidente {

    public static final String NOMBRE = "VALIDADO";
    public static final Validado INSTANCIA = new Validado();

    private Validado() {
    }

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public Set<Accion> accionesPermitidas() {
        return EnumSet.of(Accion.ASIGNAR);
    }

    @Override
    public boolean admiteAdhesiones() {
        return true;
    }

    @Override
    public boolean cuentaParaSla() {
        return true;
    }

    @Override
    public void asignar(Incidente incidente, Cuadrilla cuadrilla, Usuario operador, LocalDateTime ahora) {
        incidente.asignarCuadrilla(cuadrilla);
        incidente.cambiarEstado(Asignado.INSTANCIA, operador, "Asignado a " + cuadrilla.nombre(), ahora);
    }
}
