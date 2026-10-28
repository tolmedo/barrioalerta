package ar.utn.barrioalerta.incidentes.dominio;

import java.util.Objects;

/**
 * Tipo configurable por el administrador (patrón Type Object). Los tipos difieren solo en datos
 * (gravedad, SLA, radio de duplicado), por eso no se modelan como subclases de Incidente.
 */
public class TipoIncidente {

    private String nombre;
    private double gravedad;
    private int slaHoras;
    private int radioDuplicadoMetros;

    public TipoIncidente(String nombre, double gravedad, int slaHoras, int radioDuplicadoMetros) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre del tipo es obligatorio");
        }
        if (gravedad < 0 || gravedad > 1) {
            throw new IllegalArgumentException("La gravedad debe estar entre 0 y 1");
        }
        if (slaHoras <= 0 || radioDuplicadoMetros <= 0) {
            throw new IllegalArgumentException("El SLA y el radio de duplicado deben ser positivos");
        }
        this.nombre = nombre;
        this.gravedad = gravedad;
        this.slaHoras = slaHoras;
        this.radioDuplicadoMetros = radioDuplicadoMetros;
    }

    public String nombre() {
        return nombre;
    }

    public double gravedad() {
        return gravedad;
    }

    public int slaHoras() {
        return slaHoras;
    }

    public int radioDuplicadoMetros() {
        return radioDuplicadoMetros;
    }

    @Override
    public boolean equals(Object otro) {
        return otro instanceof TipoIncidente tipo && nombre.equals(tipo.nombre);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nombre);
    }
}
