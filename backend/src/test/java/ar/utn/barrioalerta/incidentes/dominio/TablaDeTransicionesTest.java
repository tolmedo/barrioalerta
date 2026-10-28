package ar.utn.barrioalerta.incidentes.dominio;

import static ar.utn.barrioalerta.incidentes.dominio.Escenario.ANA;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.INICIO;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.MIEMBRO_NORTE;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.NORTE;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.OPERADORA;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.evidencia;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.unBache;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * El diagrama de estados (docs/diagramas/estados-incidente.md) convertido en test: cada fila de
 * TRANSICIONES es una flecha del diagrama. Todo lo que no figura en la tabla debe ser rechazado.
 * Si se cambia el diagrama, se cambia esta tabla en el mismo PR.
 */
class TablaDeTransicionesTest {

    private static final List<String> ESTADOS = List.of(
            Reportado.NOMBRE, Validado.NOMBRE, Asignado.NOMBRE, EnCurso.NOMBRE,
            Resuelto.NOMBRE, Cerrado.NOMBRE, Rechazado.NOMBRE, Duplicado.NOMBRE);

    /** estado de origen → (acción → estado de destino). */
    private static final Map<String, Map<Accion, String>> TRANSICIONES = Map.of(
            Reportado.NOMBRE, Map.of(
                    Accion.VALIDAR, Validado.NOMBRE,
                    Accion.RECHAZAR, Rechazado.NOMBRE,
                    Accion.MARCAR_DUPLICADO, Duplicado.NOMBRE),
            Validado.NOMBRE, Map.of(
                    Accion.ASIGNAR, Asignado.NOMBRE),
            Asignado.NOMBRE, Map.of(
                    Accion.ASIGNAR, Asignado.NOMBRE,
                    Accion.INICIAR_TRABAJO, EnCurso.NOMBRE),
            EnCurso.NOMBRE, Map.of(
                    Accion.RESOLVER, Resuelto.NOMBRE),
            Resuelto.NOMBRE, Map.of(
                    Accion.CERRAR, Cerrado.NOMBRE,
                    Accion.REABRIR, Validado.NOMBRE));

    static Stream<Arguments> transicionesValidas() {
        return TRANSICIONES.entrySet().stream()
                .flatMap(origen -> origen.getValue().entrySet().stream()
                        .map(transicion -> arguments(origen.getKey(), transicion.getKey(), transicion.getValue())));
    }

    static Stream<Arguments> transicionesInvalidas() {
        return ESTADOS.stream()
                .flatMap(estado -> Arrays.stream(Accion.values())
                        .filter(accion -> !TRANSICIONES.getOrDefault(estado, Map.of()).containsKey(accion))
                        .map(accion -> arguments(estado, accion)));
    }

    static Stream<String> estados() {
        return ESTADOS.stream();
    }

    @DisplayName("Transición válida")
    @ParameterizedTest(name = "{0} --{1}--> {2}")
    @MethodSource("transicionesValidas")
    void transicionValida(String origen, Accion accion, String destino) {
        var incidente = unBache().en(origen);

        ejecutar(accion, incidente);

        assertThat(incidente.estado().nombre()).isEqualTo(destino);
        var ultimoCambio = incidente.historial().getLast();
        assertThat(ultimoCambio.estadoAnterior()).isEqualTo(origen);
        assertThat(ultimoCambio.estadoNuevo()).isEqualTo(destino);
    }

    @DisplayName("Transición inválida")
    @ParameterizedTest(name = "{0} no permite {1}")
    @MethodSource("transicionesInvalidas")
    void transicionInvalida(String origen, Accion accion) {
        var incidente = unBache().en(origen);
        var cambiosAntes = incidente.historial().size();

        assertThatThrownBy(() -> ejecutar(accion, incidente))
                .isInstanceOf(TransicionInvalidaException.class)
                .hasMessageContaining(origen);
        assertThat(incidente.estado().nombre()).isEqualTo(origen);
        assertThat(incidente.historial()).hasSize(cambiosAntes);
    }

    @DisplayName("Las acciones que ofrece la UI coinciden con la tabla")
    @ParameterizedTest(name = "{0}")
    @MethodSource("estados")
    void accionesPermitidasCoincidenConLaTabla(String estado) {
        Set<Accion> esperadas = TRANSICIONES.getOrDefault(estado, Map.of()).keySet().stream()
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(Accion.class)));

        assertThat(unBache().en(estado).accionesPermitidas()).isEqualTo(esperadas);
    }

    @DisplayName("Cada nombre persistido reconstruye el mismo estado")
    @ParameterizedTest(name = "{0}")
    @MethodSource("estados")
    void desdeNombreEsInversoDeNombre(String estado) {
        assertThat(EstadoIncidente.desdeNombre(estado).nombre()).isEqualTo(estado);
    }

    /** Ejecuta la acción con argumentos válidos, para que solo pueda fallar por el estado. */
    private static void ejecutar(Accion accion, Incidente incidente) {
        switch (accion) {
            case VALIDAR -> incidente.validar(OPERADORA, INICIO);
            case RECHAZAR -> incidente.rechazar(OPERADORA, "No corresponde", INICIO);
            case MARCAR_DUPLICADO -> incidente.marcarDuplicadoDe(unBache().reportado(), OPERADORA, INICIO);
            case ASIGNAR -> incidente.asignar(NORTE, OPERADORA, INICIO);
            case INICIAR_TRABAJO -> incidente.iniciarTrabajo(MIEMBRO_NORTE, INICIO);
            case RESOLVER -> incidente.resolver(MIEMBRO_NORTE, evidencia(INICIO), INICIO);
            case REABRIR -> incidente.reabrir(ANA, "Volvió a hundirse", INICIO);
            case CERRAR -> incidente.cerrar(ANA.usuario(), INICIO);
        }
    }
}
