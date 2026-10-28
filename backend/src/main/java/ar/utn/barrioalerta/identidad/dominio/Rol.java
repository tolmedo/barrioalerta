package ar.utn.barrioalerta.identidad.dominio;

import java.util.EnumSet;
import java.util.Objects;
import java.util.Set;

public class Rol {

    private String nombre;
    private Set<Permiso> permisos;

    public Rol(String nombre, Set<Permiso> permisos) {
        this.nombre = Objects.requireNonNull(nombre, "nombre");
        this.permisos = permisos.isEmpty() ? EnumSet.noneOf(Permiso.class) : EnumSet.copyOf(permisos);
    }

    public boolean tenesPermiso(Permiso permiso) {
        return permisos.contains(permiso);
    }

    public String nombre() {
        return nombre;
    }

    public Set<Permiso> permisos() {
        return Set.copyOf(permisos);
    }
}
