package ar.utn.barrioalerta.compartido.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Todo el código que necesita "la hora actual" recibe un {@link Clock} inyectado (DIP). Fuera del
 * perfil demo es el reloj del sistema; en el perfil demo lo reemplaza {@code RelojDeDemo} y en los
 * tests de dominio se usan fechas fijas.
 */
@Configuration
@Profile("!demo")
public class RelojConfig {

    @Bean
    public Clock reloj(@Value("${barrioalerta.zona-horaria}") String zonaHoraria) {
        return Clock.system(ZoneId.of(zonaHoraria));
    }
}
