package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

/** Tiene cuadrilla asignada; puede reasignarse o empezar a trabajarse. */
public final class Asignado implements EstadoIncidente {

    public static final String NOMBRE = "ASIGNADO";
    public static final Asignado INSTANCIA = new Asignado();

    private Asignado() {
    }

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public Set<Accion> accionesPermitidas() {
        return EnumSet.of(Accion.ASIGNAR, Accion.INICIAR_TRABAJO);
    }

    @Override
    public boolean admiteAdhesiones() {
        return true;
    }

    @Override
    public boolean cuentaParaSla() {
        return true;
    }

    /** Reasignación: transición a sí mismo, que igual queda auditada. */
    @Override
    public void asignar(Incidente incidente, Cuadrilla cuadrilla, Usuario operador, LocalDateTime ahora) {
        incidente.asignarCuadrilla(cuadrilla);
        incidente.cambiarEstado(INSTANCIA, operador, "Reasignado a " + cuadrilla.nombre(), ahora);
    }

    @Override
    public void iniciarTrabajo(Incidente incidente, Usuario miembro, LocalDateTime ahora) {
        incidente.verificarMiembroDeCuadrillaAsignada(miembro);
        incidente.cambiarEstado(EnCurso.INSTANCIA, miembro, null, ahora);
    }
}
