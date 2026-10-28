package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.compartido.dominio.ConflictoDeEstadoException;

public class TransicionInvalidaException extends ConflictoDeEstadoException {

    public TransicionInvalidaException(String estado, Accion accion) {
        super("No se puede " + accion.verbo() + " un incidente en estado " + estado);
    }
}
