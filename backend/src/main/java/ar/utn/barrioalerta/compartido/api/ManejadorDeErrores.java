package ar.utn.barrioalerta.compartido.api;

import ar.utn.barrioalerta.compartido.dominio.ConflictoDeEstadoException;
import ar.utn.barrioalerta.compartido.dominio.ReglaDeNegocioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Traduce excepciones a códigos HTTP. Nunca se responde 200 ante un error (C13 · Errores más comunes).
 */
@RestControllerAdvice
public class ManejadorDeErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorDeErrores.class);

    @ExceptionHandler(ConflictoDeEstadoException.class)
    public ResponseEntity<ErrorRespuesta> conflictoDeEstado(ConflictoDeEstadoException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorRespuesta.de("CONFLICTO_DE_ESTADO", e.getMessage()));
    }

    @ExceptionHandler(ReglaDeNegocioException.class)
    public ResponseEntity<ErrorRespuesta> reglaDeNegocio(ReglaDeNegocioException e) {
        return ResponseEntity.unprocessableEntity()
                .body(ErrorRespuesta.de("REGLA_DE_NEGOCIO", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuesta> datosInvalidos(MethodArgumentNotValidException e) {
        var detalles = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        return ResponseEntity.badRequest()
                .body(new ErrorRespuesta("DATOS_INVALIDOS", "Hay campos con errores", detalles));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRespuesta> errorInesperado(Exception e) {
        log.error("Error no controlado", e);
        return ResponseEntity.internalServerError()
                .body(ErrorRespuesta.de("ERROR_INTERNO", "Ocurrió un error inesperado"));
    }
}
