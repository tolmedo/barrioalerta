package ar.utn.barrioalerta.compartido.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SaludController.class)
class SaludControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void respondeElSaludoConLaHoraDelRelojInyectado() throws Exception {
        mvc.perform(get("/api/salud"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Hola desde BarrioAlerta"))
                .andExpect(jsonPath("$.horaDelSistema").value("2026-12-07T10:00:00"));
    }

    @TestConfiguration
    static class RelojFijo {

        @Bean
        @Primary
        Clock relojFijo() {
            return Clock.fixed(Instant.parse("2026-12-07T13:00:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));
        }
    }
}
