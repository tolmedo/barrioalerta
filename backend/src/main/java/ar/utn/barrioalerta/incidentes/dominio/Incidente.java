package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.compartido.dominio.ReglaDeNegocioException;
import ar.utn.barrioalerta.identidad.dominio.Usuario;
import ar.utn.barrioalerta.incidentes.dominio.eventos.AdhesionRegistrada;
import ar.utn.barrioalerta.incidentes.dominio.eventos.EstadoIncidenteCambiado;
import ar.utn.barrioalerta.incidentes.dominio.eventos.EventoDominio;
import ar.utn.barrioalerta.incidentes.dominio.eventos.IncidenteEscalado;
import ar.utn.barrioalerta.incidentes.dominio.eventos.IncidenteReportado;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * Raíz del agregado. Encapsula las reglas del ciclo de vida (modelo de dominio rico): los servicios
 * de aplicación solo cargan el incidente, invocan uno de estos métodos, lo guardan y publican los
 * eventos que devuelve {@link #extraerEventos()}.
 * <p>
 * La hora actual llega como parámetro ({@code ahora}): la obtiene el servicio de un {@code Clock}
 * inyectado, porque las entidades no reciben inyección de dependencias.
 */
public class Incidente {

    private Long id;
    private TipoIncidente tipo;
    private String descripcion;
    private Ubicacion ubicacion;
    private Vecino reportante;
    private LocalDateTime fechaReporte;
    private LocalDateTime vencimientoSla;
    private EstadoIncidente estado;
    private Cuadrilla cuadrillaAsignada;
    private Incidente original;
    private int nivelEscalamiento;
    private double prioridad;
    private List<CambioDeEstado> historial = new ArrayList<>();
    private List<Adhesion> adhesiones = new ArrayList<>();
    private List<Evidencia> evidencias = new ArrayList<>();
    private List<EventoDominio> eventos = new ArrayList<>();

    private Incidente(TipoIncidente tipo, String descripcion, Ubicacion ubicacion, Vecino reportante,
                      LocalDateTime ahora) {
        this.tipo = Objects.requireNonNull(tipo, "tipo");
        this.descripcion = descripcion == null ? "" : descripcion.strip();
        this.ubicacion = Objects.requireNonNull(ubicacion, "ubicacion");
        this.reportante = Objects.requireNonNull(reportante, "reportante");
        this.fechaReporte = Objects.requireNonNull(ahora, "ahora");
        this.vencimientoSla = ahora.plusHours(tipo.slaHoras());
        this.estado = Reportado.INSTANCIA;
        historial.add(new CambioDeEstado(null, Reportado.NOMBRE, reportante.usuario(), ahora, null));
        eventos.add(new IncidenteReportado(this, ahora));
    }

    public static Incidente reportar(TipoIncidente tipo, String descripcion, Ubicacion ubicacion,
                                     Vecino reportante, LocalDateTime ahora) {
        return new Incidente(tipo, descripcion, ubicacion, reportante, ahora);
    }

    // ---------------------------------------------------------------- comportamiento de negocio

    public void adherir(Vecino vecino, LocalDateTime ahora) {
        if (!estado.admiteAdhesiones()) {
            throw new ReglaDeNegocioException("Un incidente en estado " + estado.nombre() + " no admite adhesiones");
        }
        if (esReportante(vecino.usuario())) {
            throw new ReglaDeNegocioException("Quien reportó el incidente no puede adherir a él");
        }
        if (adhesiones.stream().anyMatch(adhesion -> adhesion.vecino().usuario().equals(vecino.usuario()))) {
            throw new ReglaDeNegocioException("El vecino ya adhirió a este incidente");
        }
        adhesiones.add(new Adhesion(vecino, ahora));
        eventos.add(new AdhesionRegistrada(this, vecino, ahora));
    }

    public void validar(Usuario operador, LocalDateTime ahora) {
        estado.validar(this, operador, ahora);
    }

    public void rechazar(Usuario operador, String motivo, LocalDateTime ahora) {
        exigirMotivo(motivo);
        estado.rechazar(this, operador, motivo, ahora);
    }

    public void marcarDuplicadoDe(Incidente original, Usuario operador, LocalDateTime ahora) {
        if (original == this) {
            throw new ReglaDeNegocioException("Un incidente no puede ser duplicado de sí mismo");
        }
        if (!original.tipo.equals(tipo)) {
            throw new ReglaDeNegocioException("El incidente original debe ser del mismo tipo");
        }
        estado.marcarDuplicadoDe(this, original, operador, ahora);
    }

    public void asignar(Cuadrilla cuadrilla, Usuario operador, LocalDateTime ahora) {
        if (!cuadrilla.puedeAtender(tipo)) {
            throw new ReglaDeNegocioException("La cuadrilla " + cuadrilla.nombre()
                    + " no tiene la especialidad " + tipo.nombre());
        }
        estado.asignar(this, cuadrilla, operador, ahora);
    }

    public void iniciarTrabajo(Usuario miembro, LocalDateTime ahora) {
        estado.iniciarTrabajo(this, miembro, ahora);
    }

    public void resolver(Usuario miembro, Evidencia evidencia, LocalDateTime ahora) {
        if (evidencia == null) {
            throw new ReglaDeNegocioException("Para resolver un incidente hace falta una foto de evidencia");
        }
        estado.resolver(this, evidencia, miembro, ahora);
    }

    public void reabrir(Vecino vecino, String motivo, LocalDateTime ahora) {
        if (!esReportante(vecino.usuario())) {
            throw new ReglaDeNegocioException("Solo quien reportó el incidente puede reabrirlo");
        }
        exigirMotivo(motivo);
        estado.reabrir(this, vecino, motivo, ahora);
    }

    /** Lo cierra el vecino que reportó (confirmando la resolución) o el sistema por tiempo. */
    public void cerrar(Usuario actor, LocalDateTime ahora) {
        if (!actor.esSistema() && !esReportante(actor)) {
            throw new ReglaDeNegocioException("Solo quien reportó el incidente o el sistema pueden cerrarlo");
        }
        estado.cerrar(this, actor, ahora);
    }

    public boolean estaVencido(LocalDateTime ahora) {
        return estado.cuentaParaSla() && !ahora.isBefore(vencimientoSla);
    }

    /**
     * Escala como máximo una vez por período de SLA: con un SLA de 48 h, el nivel 1 llega a las 48 h
     * del reporte, el nivel 2 a las 96 h, etc. El escalamiento no es un estado porque no cambia el
     * comportamiento del incidente (C13: no usar State si el comportamiento no varía).
     */
    public boolean debeEscalar(LocalDateTime ahora) {
        var proximoEscalamiento = vencimientoSla.plusHours((long) tipo.slaHoras() * nivelEscalamiento);
        return estado.cuentaParaSla() && !ahora.isBefore(proximoEscalamiento);
    }

    public void escalar(LocalDateTime ahora) {
        if (!debeEscalar(ahora)) {
            throw new ReglaDeNegocioException("El incidente no está en condiciones de escalar");
        }
        nivelEscalamiento++;
        eventos.add(new IncidenteEscalado(this, nivelEscalamiento, ahora));
    }

    /** La prioridad la calcula una {@code EstrategiaPriorizacion} y se guarda desnormalizada para el ranking. */
    public void actualizarPrioridad(double nuevaPrioridad) {
        if (nuevaPrioridad < 0 || nuevaPrioridad > 1) {
            throw new IllegalArgumentException("La prioridad debe estar entre 0 y 1");
        }
        this.prioridad = nuevaPrioridad;
    }

    public Set<Accion> accionesPermitidas() {
        return estado.accionesPermitidas();
    }

    /** Devuelve los eventos ocurridos desde la última extracción, para publicarlos después de guardar. */
    public List<EventoDominio> extraerEventos() {
        var pendientes = List.copyOf(eventos);
        eventos.clear();
        return pendientes;
    }

    public boolean esReportante(Usuario usuario) {
        return reportante.usuario().equals(usuario);
    }

    // ---------------------------------------------------------------- uso exclusivo de los estados

    /** Único punto de cambio de estado: garantiza que toda transición quede auditada y publicada. */
    void cambiarEstado(EstadoIncidente nuevo, Usuario actor, String motivo, LocalDateTime ahora) {
        Objects.requireNonNull(actor, "Toda transición necesita un actor");
        var anterior = estado;
        estado = nuevo;
        historial.add(new CambioDeEstado(anterior.nombre(), nuevo.nombre(), actor, ahora, motivo));
        eventos.add(new EstadoIncidenteCambiado(this, anterior.nombre(), nuevo.nombre(), actor, ahora));
    }

    void asignarCuadrilla(Cuadrilla cuadrilla) {
        this.cuadrillaAsignada = cuadrilla;
    }

    void liberarCuadrilla() {
        this.cuadrillaAsignada = null;
    }

    void registrarOriginal(Incidente original) {
        this.original = original;
    }

    void agregarEvidencia(Evidencia evidencia) {
        evidencias.add(evidencia);
    }

    void verificarMiembroDeCuadrillaAsignada(Usuario usuario) {
        if (cuadrillaAsignada == null || !cuadrillaAsignada.tieneMiembro(usuario)) {
            throw new ReglaDeNegocioException(usuario + " no pertenece a la cuadrilla asignada");
        }
    }

    LocalDateTime fechaUltimoCambio() {
        return historial.getLast().fecha();
    }

    private static void exigirMotivo(String motivo) {
        if (motivo == null || motivo.isBlank()) {
            throw new ReglaDeNegocioException("El motivo es obligatorio");
        }
    }

    // ---------------------------------------------------------------- consultas

    public Long id() {
        return id;
    }

    public TipoIncidente tipo() {
        return tipo;
    }

    public String descripcion() {
        return descripcion;
    }

    public Ubicacion ubicacion() {
        return ubicacion;
    }

    public Vecino reportante() {
        return reportante;
    }

    public LocalDateTime fechaReporte() {
        return fechaReporte;
    }

    public LocalDateTime vencimientoSla() {
        return vencimientoSla;
    }

    public EstadoIncidente estado() {
        return estado;
    }

    public Optional<Cuadrilla> cuadrillaAsignada() {
        return Optional.ofNullable(cuadrillaAsignada);
    }

    public Optional<Incidente> original() {
        return Optional.ofNullable(original);
    }

    public int nivelEscalamiento() {
        return nivelEscalamiento;
    }

    public double prioridad() {
        return prioridad;
    }

    public List<CambioDeEstado> historial() {
        return List.copyOf(historial);
    }

    public List<Adhesion> adhesiones() {
        return List.copyOf(adhesiones);
    }

    public int cantidadAdhesiones() {
        return adhesiones.size();
    }

    public List<Evidencia> evidencias() {
        return List.copyOf(evidencias);
    }
}
