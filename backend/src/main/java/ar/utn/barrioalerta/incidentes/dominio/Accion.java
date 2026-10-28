package ar.utn.barrioalerta.incidentes.dominio;

/**
 * Acciones que cambian el estado de un incidente. El front muestra solo las que devuelve
 * {@link Incidente#accionesPermitidas()}, así nunca ofrece una transición inválida.
 */
public enum Accion {
    VALIDAR("validar"),
    RECHAZAR("rechazar"),
    MARCAR_DUPLICADO("marcar como duplicado"),
    ASIGNAR("asignar"),
    INICIAR_TRABAJO("iniciar el trabajo de"),
    RESOLVER("resolver"),
    REABRIR("reabrir"),
    CERRAR("cerrar");

    private final String verbo;

    Accion(String verbo) {
        this.verbo = verbo;
    }

    public String verbo() {
        return verbo;
    }
}
