package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

/** La cuadrilla está trabajando; solo puede resolverse con evidencia. */
public final class EnCurso implements EstadoIncidente {

    public static final String NOMBRE = "EN_CURSO";
    public static final EnCurso INSTANCIA = new EnCurso();

    private EnCurso() {
    }

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public Set<Accion> accionesPermitidas() {
        return EnumSet.of(Accion.RESOLVER);
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
    public void resolver(Incidente incidente, Evidencia evidencia, Usuario miembro, LocalDateTime ahora) {
        incidente.verificarMiembroDeCuadrillaAsignada(miembro);
        incidente.agregarEvidencia(evidencia);
        incidente.cambiarEstado(Resuelto.INSTANCIA, miembro, evidencia.nota(), ahora);
    }
}
