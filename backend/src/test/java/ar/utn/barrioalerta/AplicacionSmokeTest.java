package ar.utn.barrioalerta;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ActiveProfiles;

/** Smoke test (U8): la aplicación completa levanta y responde. Usa H2 en lugar de PostgreSQL. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AplicacionSmokeTest {

    @Autowired
    private TestRestTemplate http;

    @Test
    void laApiDeSaludRespondeYActuatorEstaUp() {
        assertThat(http.getForObject("/api/salud", String.class)).contains("Hola desde BarrioAlerta");
        assertThat(http.getForObject("/actuator/health", String.class)).contains("UP");
    }
}
