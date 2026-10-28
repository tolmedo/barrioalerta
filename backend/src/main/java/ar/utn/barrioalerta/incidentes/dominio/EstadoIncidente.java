package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Patrón State (C03 · Patron State). Cada estado concreto redefine solo las transiciones válidas
 * desde él; el resto conserva el comportamiento por defecto, que rechaza la acción.
 * <p>
 * El propio estado decide cuál es el siguiente (opción B de C03), pero siempre a través de
 * {@link Incidente#cambiarEstado}, que es el único punto que registra la auditoría.
 * <p>
 * Los estados no tienen atributos (stateless, C06): existe una única instancia de cada uno y se
 * persisten por nombre.
 */
public interface EstadoIncidente {

    String nombre();

    Set<Accion> accionesPermitidas();

    default boolean admiteAdhesiones() {
        return false;
    }

    /** Si el SLA del incidente corre en este estado (y por lo tanto puede escalar). */
    default boolean cuentaParaSla() {
        return false;
    }

    default void validar(Incidente incidente, Usuario operador, LocalDateTime ahora) {
        throw transicionInvalida(Accion.VALIDAR);
    }

    default void rechazar(Incidente incidente, Usuario operador, String motivo, LocalDateTime ahora) {
        throw transicionInvalida(Accion.RECHAZAR);
    }

    default void marcarDuplicadoDe(Incidente incidente, Incidente original, Usuario operador, LocalDateTime ahora) {
        throw transicionInvalida(Accion.MARCAR_DUPLICADO);
    }

    default void asignar(Incidente incidente, Cuadrilla cuadrilla, Usuario operador, LocalDateTime ahora) {
        throw transicionInvalida(Accion.ASIGNAR);
    }

    default void iniciarTrabajo(Incidente incidente, Usuario miembro, LocalDateTime ahora) {
        throw transicionInvalida(Accion.INICIAR_TRABAJO);
    }

    default void resolver(Incidente incidente, Evidencia evidencia, Usuario miembro, LocalDateTime ahora) {
        throw transicionInvalida(Accion.RESOLVER);
    }

    default void reabrir(Incidente incidente, Vecino vecino, String motivo, LocalDateTime ahora) {
        throw transicionInvalida(Accion.REABRIR);
    }

    default void cerrar(Incidente incidente, Usuario actor, LocalDateTime ahora) {
        throw transicionInvalida(Accion.CERRAR);
    }

    private TransicionInvalidaException transicionInvalida(Accion accion) {
        return new TransicionInvalidaException(nombre(), accion);
    }

    /** Reconstruye el estado a partir del nombre persistido. Es el único lugar con un switch por estado. */
    static EstadoIncidente desdeNombre(String nombre) {
        return switch (nombre) {
            case Reportado.NOMBRE -> Reportado.INSTANCIA;
            case Validado.NOMBRE -> Validado.INSTANCIA;
            case Asignado.NOMBRE -> Asignado.INSTANCIA;
            case EnCurso.NOMBRE -> EnCurso.INSTANCIA;
            case Resuelto.NOMBRE -> Resuelto.INSTANCIA;
            case Cerrado.NOMBRE -> Cerrado.INSTANCIA;
            case Rechazado.NOMBRE -> Rechazado.INSTANCIA;
            case Duplicado.NOMBRE -> Duplicado.INSTANCIA;
            default -> throw new IllegalArgumentException("Estado de incidente desconocido: " + nombre);
        };
    }
}
