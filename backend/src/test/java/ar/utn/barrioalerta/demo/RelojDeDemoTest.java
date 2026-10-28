package ar.utn.barrioalerta.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class RelojDeDemoTest {

    private static final ZoneId BUENOS_AIRES = ZoneId.of("America/Argentina/Buenos_Aires");

    @Test
    void quedaCongeladoHastaQueSeLoAvanza() {
        var reloj = new RelojDeDemo(Instant.parse("2026-12-07T13:00:00Z"), BUENOS_AIRES);

        assertThat(LocalDateTime.now(reloj)).isEqualTo(LocalDateTime.of(2026, 12, 7, 10, 0));

        reloj.avanzar(Duration.ofHours(48));

        assertThat(LocalDateTime.now(reloj)).isEqualTo(LocalDateTime.of(2026, 12, 9, 10, 0));
    }

    @Test
    void noRetrocede() {
        var reloj = new RelojDeDemo(Instant.parse("2026-12-07T13:00:00Z"), BUENOS_AIRES);

        assertThatThrownBy(() -> reloj.avanzar(Duration.ofHours(-1))).isInstanceOf(IllegalArgumentException.class);
    }
}
