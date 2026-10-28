package ar.utn.barrioalerta.compartido.dominio;

/** Los datos son válidos en forma pero violan una regla del negocio (se traduce a HTTP 422). */
public class ReglaDeNegocioException extends ExcepcionDeDominio {

    public ReglaDeNegocioException(String mensaje) {
        super(mensaje);
    }
}
