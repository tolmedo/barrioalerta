package ar.utn.barrioalerta.compartido.dominio;

/**
 * Raíz de las excepciones que expresan una regla del negocio violada. La capa API las traduce a
 * códigos HTTP sin que el dominio conozca HTTP.
 */
public abstract class ExcepcionDeDominio extends RuntimeException {

    protected ExcepcionDeDominio(String mensaje) {
        super(mensaje);
    }
}
