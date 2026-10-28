package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.compartido.dominio.ReglaDeNegocioException;
import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

/** La cuadrilla lo resolvió; el vecino confirma (o se cierra solo) o lo reabre. */
public final class Resuelto implements EstadoIncidente {

    public static final String NOMBRE = "RESUELTO";
    public static final Resuelto INSTANCIA = new Resuelto();

    /** Plazo que tiene el vecino para reabrir un incidente resuelto. */
    public static final Duration PLAZO_REAPERTURA = Duration.ofDays(7);

    private Resuelto() {
    }

    @Override
    public String nombre() {
        return NOMBRE;
    }

    @Override
    public Set<Accion> accionesPermitidas() {
        return EnumSet.of(Accion.CERRAR, Accion.REABRIR);
    }

    @Override
    public void cerrar(Incidente incidente, Usuario actor, LocalDateTime ahora) {
        incidente.cambiarEstado(Cerrado.INSTANCIA, actor, null, ahora);
    }

    @Override
    public void reabrir(Incidente incidente, Vecino vecino, String motivo, LocalDateTime ahora) {
        if (ahora.isAfter(incidente.fechaUltimoCambio().plus(PLAZO_REAPERTURA))) {
            throw new ReglaDeNegocioException("Pasó el plazo de " + PLAZO_REAPERTURA.toDays()
                    + " días para reabrir el incidente");
        }
        incidente.liberarCuadrilla();
        incidente.cambiarEstado(Validado.INSTANCIA, vecino.usuario(), motivo, ahora);
    }
}
