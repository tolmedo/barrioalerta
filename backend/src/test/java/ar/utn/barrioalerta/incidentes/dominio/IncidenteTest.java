package ar.utn.barrioalerta.incidentes.dominio;

import static ar.utn.barrioalerta.incidentes.dominio.Escenario.ANA;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.BRUNO;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.INICIO;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.LUMINARIAS;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.MEDRANO_950;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.MIEMBRO_LUMINARIAS;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.MIEMBRO_NORTE;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.NORTE;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.OBELISCO;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.OPERADORA;
import static ar.utn.barrioalerta.incidentes.dominio.Escenario.unBache;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

import ar.utn.barrioalerta.compartido.dominio.ReglaDeNegocioException;
import ar.utn.barrioalerta.identidad.dominio.Usuario;
import ar.utn.barrioalerta.incidentes.dominio.eventos.AdhesionRegistrada;
import ar.utn.barrioalerta.incidentes.dominio.eventos.EstadoIncidenteCambiado;
import ar.utn.barrioalerta.incidentes.dominio.eventos.IncidenteEscalado;
import ar.utn.barrioalerta.incidentes.dominio.eventos.IncidenteReportado;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class IncidenteTest {

    @Nested
    @DisplayName("Auditoría")
    class Auditoria {

        @Test
        void elAltaQuedaRegistradaComoPrimerCambioFirmadoPorElReportante() {
            var incidente = unBache().reportado();

            var alta = incidente.historial().getFirst();
            assertThat(alta.estadoAnterior()).isNull();
            assertThat(alta.estadoNuevo()).isEqualTo(Reportado.NOMBRE);
            assertThat(alta.actor()).isEqualTo(ANA.usuario());
            assertThat(alta.fecha()).isEqualTo(INICIO);
        }

        @Test
        void cadaTransicionRegistraQuienQueCuandoYPorQue() {
            var incidente = unBache().reportado();

            incidente.rechazar(OPERADORA, "Está en propiedad privada", INICIO.plusHours(2));

            var cambio = incidente.historial().getLast();
            assertThat(cambio.actor()).isEqualTo(OPERADORA);
            assertThat(cambio.estadoAnterior()).isEqualTo(Reportado.NOMBRE);
            assertThat(cambio.estadoNuevo()).isEqualTo(Rechazado.NOMBRE);
            assertThat(cambio.fecha()).isEqualTo(INICIO.plusHours(2));
            assertThat(cambio.motivo()).isEqualTo("Está en propiedad privada");
        }

        @Test
        void laReasignacionQuedaAuditadaAunqueNoCambieElEstado() {
            var sur = new Cuadrilla("Sur", MEDRANO_950, NORTE.especialidades(), NORTE.miembros());
            var incidente = unBache().en(Asignado.NOMBRE);

            incidente.asignar(sur, OPERADORA, INICIO);

            var cambio = incidente.historial().getLast();
            assertThat(cambio.estadoAnterior()).isEqualTo(Asignado.NOMBRE);
            assertThat(cambio.estadoNuevo()).isEqualTo(Asignado.NOMBRE);
            assertThat(cambio.motivo()).isEqualTo("Reasignado a Sur");
            assertThat(incidente.cuadrillaAsignada()).contains(sur);
        }

        @Test
        void rechazarExigeMotivo() {
            var incidente = unBache().reportado();

            assertThatThrownBy(() -> incidente.rechazar(OPERADORA, " ", INICIO))
                    .isInstanceOf(ReglaDeNegocioException.class);
        }
    }

    @Nested
    @DisplayName("Adhesiones")
    class Adhesiones {

        @Test
        void otroVecinoPuedeAdherirAUnIncidenteAbierto() {
            var incidente = unBache().en(Validado.NOMBRE);

            incidente.adherir(BRUNO, INICIO);

            assertThat(incidente.cantidadAdhesiones()).isEqualTo(1);
            assertThat(incidente.extraerEventos()).singleElement().isInstanceOf(AdhesionRegistrada.class);
        }

        @Test
        void elReportanteNoPuedeAdherir() {
            var incidente = unBache().reportado();

            assertThatThrownBy(() -> incidente.adherir(ANA, INICIO)).isInstanceOf(ReglaDeNegocioException.class);
        }

        @Test
        void nadieAdhiereDosVeces() {
            var incidente = unBache().reportado();
            incidente.adherir(BRUNO, INICIO);

            assertThatThrownBy(() -> incidente.adherir(BRUNO, INICIO)).isInstanceOf(ReglaDeNegocioException.class);
        }

        @Test
        void unIncidenteResueltoNoAdmiteAdhesiones() {
            var incidente = unBache().en(Resuelto.NOMBRE);

            assertThatThrownBy(() -> incidente.adherir(BRUNO, INICIO))
                    .isInstanceOf(ReglaDeNegocioException.class)
                    .hasMessageContaining(Resuelto.NOMBRE);
        }
    }

    @Nested
    @DisplayName("Reglas de cuadrillas")
    class Cuadrillas {

        @Test
        void noSeAsignaUnaCuadrillaSinLaEspecialidad() {
            var incidente = unBache().en(Validado.NOMBRE);

            assertThatThrownBy(() -> incidente.asignar(LUMINARIAS, OPERADORA, INICIO))
                    .isInstanceOf(ReglaDeNegocioException.class)
                    .hasMessageContaining("Luminarias");
        }

        @Test
        void soloUnMiembroDeLaCuadrillaAsignadaIniciaElTrabajo() {
            var incidente = unBache().en(Asignado.NOMBRE);

            assertThatThrownBy(() -> incidente.iniciarTrabajo(MIEMBRO_LUMINARIAS, INICIO))
                    .isInstanceOf(ReglaDeNegocioException.class);
            assertThat(incidente.estado()).isEqualTo(Asignado.INSTANCIA);
        }

        @Test
        void resolverExigeEvidencia() {
            var incidente = unBache().en(EnCurso.NOMBRE);

            assertThatThrownBy(() -> incidente.resolver(MIEMBRO_NORTE, null, INICIO))
                    .isInstanceOf(ReglaDeNegocioException.class);
        }
    }

    @Nested
    @DisplayName("Cierre y reapertura")
    class CierreYReapertura {

        @Test
        void elSistemaPuedeCerrarPorTiempo() {
            var incidente = unBache().en(Resuelto.NOMBRE);

            incidente.cerrar(Usuario.SISTEMA, INICIO.plusHours(72));

            assertThat(incidente.estado()).isEqualTo(Cerrado.INSTANCIA);
            assertThat(incidente.historial().getLast().actor().esSistema()).isTrue();
        }

        @Test
        void otroVecinoNoPuedeCerrar() {
            var incidente = unBache().en(Resuelto.NOMBRE);

            assertThatThrownBy(() -> incidente.cerrar(BRUNO.usuario(), INICIO))
                    .isInstanceOf(ReglaDeNegocioException.class);
        }

        @Test
        void reabrirVuelveAValidadoYLiberaLaCuadrilla() {
            var incidente = unBache().en(Resuelto.NOMBRE);

            incidente.reabrir(ANA, "Se volvió a hundir", INICIO.plusDays(2));

            assertThat(incidente.estado()).isEqualTo(Validado.INSTANCIA);
            assertThat(incidente.cuadrillaAsignada()).isEmpty();
        }

        @Test
        void noSePuedeReabrirPasadoElPlazo() {
            var incidente = unBache().en(Resuelto.NOMBRE);

            assertThatThrownBy(() -> incidente.reabrir(ANA, "Se volvió a hundir", INICIO.plusDays(8)))
                    .isInstanceOf(ReglaDeNegocioException.class);
        }

        @Test
        void soloElReportantePuedeReabrir() {
            var incidente = unBache().en(Resuelto.NOMBRE);

            assertThatThrownBy(() -> incidente.reabrir(BRUNO, "No me gusta", INICIO))
                    .isInstanceOf(ReglaDeNegocioException.class);
        }
    }

    @Nested
    @DisplayName("SLA y escalamiento")
    class Sla {

        @Test
        void elVencimientoSeCalculaDesdeElReporteConElSlaDelTipo() {
            assertThat(unBache().reportado().vencimientoSla()).isEqualTo(INICIO.plusHours(48));
        }

        @Test
        void unIncidenteValidadoVenceAlCumplirseElSla() {
            var incidente = unBache().en(Validado.NOMBRE);

            assertThat(incidente.estaVencido(INICIO.plusHours(47))).isFalse();
            assertThat(incidente.estaVencido(INICIO.plusHours(48))).isTrue();
        }

        @Test
        void elSlaNoCorreEnEstadosQueNoLoCuentan() {
            assertThat(unBache().reportado().estaVencido(INICIO.plusDays(10))).isFalse();
            assertThat(unBache().en(Resuelto.NOMBRE).estaVencido(INICIO.plusDays(10))).isFalse();
        }

        @Test
        void escalaUnaVezPorPeriodoDeSla() {
            var incidente = unBache().en(Asignado.NOMBRE);

            incidente.escalar(INICIO.plusHours(48));

            assertThat(incidente.nivelEscalamiento()).isEqualTo(1);
            assertThat(incidente.debeEscalar(INICIO.plusHours(95))).isFalse();
            assertThat(incidente.debeEscalar(INICIO.plusHours(96))).isTrue();
            assertThat(incidente.extraerEventos()).singleElement().isInstanceOf(IncidenteEscalado.class);
        }

        @Test
        void noSeEscalaAntesDeTiempo() {
            var incidente = unBache().en(Validado.NOMBRE);

            assertThatThrownBy(() -> incidente.escalar(INICIO.plusHours(10)))
                    .isInstanceOf(ReglaDeNegocioException.class);
        }
    }

    @Nested
    @DisplayName("Eventos de dominio")
    class Eventos {

        @Test
        void reportarYValidarGeneranSusEventosYExtraerLosVacia() {
            var incidente = unBache().reportado();
            incidente.validar(OPERADORA, INICIO);

            var eventos = incidente.extraerEventos();

            assertThat(eventos).hasSize(2);
            assertThat(eventos.get(0)).isInstanceOf(IncidenteReportado.class);
            assertThat(eventos.get(1)).isInstanceOfSatisfying(EstadoIncidenteCambiado.class, evento -> {
                assertThat(evento.estadoNuevo()).isEqualTo(Validado.NOMBRE);
                assertThat(evento.actor()).isEqualTo(OPERADORA);
            });
            assertThat(incidente.extraerEventos()).isEmpty();
        }
    }

    @Test
    void laDistanciaEntreUtnMedranoYElObeliscoEsDeUnos3600Metros() {
        assertThat(MEDRANO_950.distanciaMetrosA(OBELISCO)).isCloseTo(3578, within(25.0));
    }
}
