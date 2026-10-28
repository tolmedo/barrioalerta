package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Permiso;
import ar.utn.barrioalerta.identidad.dominio.Rol;
import ar.utn.barrioalerta.identidad.dominio.TipoCanal;
import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Datos de prueba compartidos (los mismos nombres que el seed de la demo) y un builder que lleva un
 * incidente a cualquier estado usando solo transiciones reales, nunca setters.
 */
final class Escenario {

    static final LocalDateTime INICIO = LocalDateTime.of(2026, 12, 7, 10, 0);

    static final Rol ROL_VECINO = new Rol("VECINO", Set.of(Permiso.REPORTAR_INCIDENTE, Permiso.ADHERIR_INCIDENTE));
    static final Rol ROL_OPERADOR = new Rol("OPERADOR", Set.of(Permiso.GESTIONAR_INCIDENTES, Permiso.ASIGNAR_CUADRILLAS));
    static final Rol ROL_CUADRILLA = new Rol("CUADRILLA", Set.of(Permiso.EJECUTAR_TRABAJOS));

    static final Usuario OPERADORA = new Usuario("operadora.carla", ROL_OPERADOR);
    static final Usuario MIEMBRO_NORTE = new Usuario("cuadrilla.norte.1", ROL_CUADRILLA);
    static final Usuario MIEMBRO_LUMINARIAS = new Usuario("cuadrilla.luminarias.1", ROL_CUADRILLA);

    static final Vecino ANA = new Vecino("Ana", new Usuario("vecina.ana", ROL_VECINO), "Almagro", TipoCanal.WHATSAPP);
    static final Vecino BRUNO = new Vecino("Bruno", new Usuario("vecino.bruno", ROL_VECINO), "Almagro", TipoCanal.EMAIL);

    static final TipoIncidente BACHE = new TipoIncidente("Bache", 0.8, 48, 50);
    static final TipoIncidente LUMINARIA = new TipoIncidente("Luminaria", 0.6, 72, 30);

    static final Ubicacion MEDRANO_950 = new Ubicacion(-34.5986, -58.4202, "Av. Medrano 950", "Almagro");
    static final Ubicacion OBELISCO = new Ubicacion(-34.6037, -58.3816, "Av. Corrientes y 9 de Julio", "San Nicolás");

    static final Cuadrilla NORTE = new Cuadrilla("Norte", MEDRANO_950, Set.of(BACHE), List.of(MIEMBRO_NORTE));
    static final Cuadrilla LUMINARIAS = new Cuadrilla("Luminarias", OBELISCO, Set.of(LUMINARIA), List.of(MIEMBRO_LUMINARIAS));

    private Escenario() {
    }

    static IncidenteBuilder unBache() {
        return new IncidenteBuilder();
    }

    static Evidencia evidencia(LocalDateTime fecha) {
        return new Evidencia("fotos/bache-reparado.jpg", "Bache rellenado", MIEMBRO_NORTE, fecha);
    }

    /** Builder de datos de prueba (C06 · Patrones creacionales). */
    static final class IncidenteBuilder {

        private Vecino reportante = ANA;
        private LocalDateTime ahora = INICIO;

        IncidenteBuilder reportadoPor(Vecino vecino) {
            this.reportante = vecino;
            return this;
        }

        IncidenteBuilder el(LocalDateTime fecha) {
            this.ahora = fecha;
            return this;
        }

        Incidente reportado() {
            return Incidente.reportar(BACHE, "Bache profundo en la mano que va al centro", MEDRANO_950, reportante, ahora);
        }

        /** Construye el incidente y lo lleva al estado pedido recorriendo el camino feliz. */
        Incidente en(String estado) {
            var incidente = reportado();
            switch (estado) {
                case Reportado.NOMBRE -> { }
                case Rechazado.NOMBRE -> incidente.rechazar(OPERADORA, "Está en propiedad privada", ahora);
                case Duplicado.NOMBRE -> incidente.marcarDuplicadoDe(reportado(), OPERADORA, ahora);
                default -> avanzarHasta(incidente, estado);
            }
            incidente.extraerEventos();
            return incidente;
        }

        private void avanzarHasta(Incidente incidente, String estado) {
            incidente.validar(OPERADORA, ahora);
            if (estado.equals(Validado.NOMBRE)) {
                return;
            }
            incidente.asignar(NORTE, OPERADORA, ahora);
            if (estado.equals(Asignado.NOMBRE)) {
                return;
            }
            incidente.iniciarTrabajo(MIEMBRO_NORTE, ahora);
            if (estado.equals(EnCurso.NOMBRE)) {
                return;
            }
            incidente.resolver(MIEMBRO_NORTE, evidencia(ahora), ahora);
            if (estado.equals(Resuelto.NOMBRE)) {
                return;
            }
            incidente.cerrar(reportante.usuario(), ahora);
        }
    }
}
