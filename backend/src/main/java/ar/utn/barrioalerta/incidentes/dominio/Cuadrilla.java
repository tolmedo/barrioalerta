package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Equipo de trabajo del municipio. Vive en el módulo de incidentes (y no en el de asignación)
 * porque {@link Incidente} la referencia: así las dependencias entre módulos van en un solo
 * sentido (asignación → incidentes) y no hay ciclos.
 */
public class Cuadrilla {

    private String nombre;
    private Ubicacion base;
    private Set<TipoIncidente> especialidades;
    private List<Usuario> miembros;

    public Cuadrilla(String nombre, Ubicacion base, Set<TipoIncidente> especialidades, List<Usuario> miembros) {
        this.nombre = Objects.requireNonNull(nombre, "nombre");
        this.base = Objects.requireNonNull(base, "base");
        this.especialidades = Set.copyOf(especialidades);
        if (miembros.isEmpty()) {
            throw new IllegalArgumentException("Una cuadrilla necesita al menos un miembro");
        }
        this.miembros = List.copyOf(miembros);
    }

    public boolean puedeAtender(TipoIncidente tipo) {
        return especialidades.contains(tipo);
    }

    public boolean tieneMiembro(Usuario usuario) {
        return miembros.contains(usuario);
    }

    public String nombre() {
        return nombre;
    }

    public Ubicacion base() {
        return base;
    }

    public Set<TipoIncidente> especialidades() {
        return especialidades;
    }

    public List<Usuario> miembros() {
        return miembros;
    }

    @Override
    public boolean equals(Object otra) {
        return otra instanceof Cuadrilla cuadrilla && nombre.equals(cuadrilla.nombre);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nombre);
    }
}
