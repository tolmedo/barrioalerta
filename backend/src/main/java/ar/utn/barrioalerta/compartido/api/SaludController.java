package ar.utn.barrioalerta.compartido.api;

import java.time.Clock;
import java.time.LocalDateTime;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint mínimo para verificar que la API responde (equivalente al "Hola" de DonaTrack E1). */
@RestController
@RequestMapping("/api/salud")
public class SaludController {

    private final Clock reloj;

    public SaludController(Clock reloj) {
        this.reloj = reloj;
    }

    @GetMapping
    public Salud salud() {
        return new Salud("Hola desde BarrioAlerta", LocalDateTime.now(reloj));
    }

    public record Salud(String mensaje, LocalDateTime horaDelSistema) {
    }
}
