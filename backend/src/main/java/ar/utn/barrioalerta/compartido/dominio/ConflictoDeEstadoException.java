package ar.utn.barrioalerta.compartido.dominio;

/** La operación no es válida para el estado actual del objeto (se traduce a HTTP 409). */
public class ConflictoDeEstadoException extends ExcepcionDeDominio {

    public ConflictoDeEstadoException(String mensaje) {
        super(mensaje);
    }
}
