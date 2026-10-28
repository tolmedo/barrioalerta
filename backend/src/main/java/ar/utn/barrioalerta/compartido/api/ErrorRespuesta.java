package ar.utn.barrioalerta.compartido.api;

import java.util.List;

/** Cuerpo uniforme de todas las respuestas de error de la API. */
public record ErrorRespuesta(String codigo, String mensaje, List<String> detalles) {

    public static ErrorRespuesta de(String codigo, String mensaje) {
        return new ErrorRespuesta(codigo, mensaje, List.of());
    }
}
