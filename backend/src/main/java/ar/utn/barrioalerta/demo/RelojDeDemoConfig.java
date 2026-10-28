package ar.utn.barrioalerta.demo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("demo")
public class RelojDeDemoConfig {

    private static final LocalTime HORA_DE_INICIO = LocalTime.of(10, 0);

    @Bean
    public RelojDeDemo reloj(@Value("${barrioalerta.zona-horaria}") String zonaHoraria,
                             @Value("${barrioalerta.demo.reloj-inicial:}") String relojInicial) {
        var zona = ZoneId.of(zonaHoraria);
        var inicio = relojInicial.isBlank()
                ? LocalDate.now(zona).atTime(HORA_DE_INICIO)
                : LocalDateTime.parse(relojInicial);
        return new RelojDeDemo(inicio.atZone(zona).toInstant(), zona);
    }
}
