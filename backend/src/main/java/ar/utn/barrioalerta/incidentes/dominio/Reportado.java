package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

/** Recién reportado por un vecino; espera que un operador lo valide, rechace o marque duplicado. */
public final class Reportado implements EstadoIncidente {

    public static final String NOMBRE = "REPORTADO";
    public static final Reportado INSTANCIA = new Reportado();

    private Reportado() {
    }

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public Set<Accion> accionesPermitidas() {
        return EnumSet.of(Accion.VALIDAR, Accion.RECHAZAR, Accion.MARCAR_DUPLICADO);
    }

    @Override
    public boolean admiteAdhesiones() {
        return true;
    }

    @Override
    public void validar(Incidente incidente, Usuario operador, LocalDateTime ahora) {
        incidente.cambiarEstado(Validado.INSTANCIA, operador, null, ahora);
    }

    @Override
    public void rechazar(Incidente incidente, Usuario operador, String motivo, LocalDateTime ahora) {
        incidente.cambiarEstado(Rechazado.INSTANCIA, operador, motivo, ahora);
    }

    @Override
    public void marcarDuplicadoDe(Incidente incidente, Incidente original, Usuario operador, LocalDateTime ahora) {
        incidente.registrarOriginal(original);
        incidente.cambiarEstado(Duplicado.INSTANCIA, operador, "Duplicado de otro incidente", ahora);
    }
}
