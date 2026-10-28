package ar.utn.barrioalerta.identidad.dominio;

import java.util.Objects;
import java.util.Set;

/**
 * Datos de acceso de una persona o de otro sistema. Los actores de dominio que tienen relaciones
 * propias (Vecino, miembros de Cuadrilla) referencian a su Usuario; Operador y Admin son solo un rol.
 */
public class Usuario {

    private static final String NOMBRE_SISTEMA = "sistema";

    /** Actor que firma las acciones automáticas (cierre por tiempo, escalamiento) en la auditoría. */
    public static final Usuario SISTEMA = new Usuario(NOMBRE_SISTEMA, new Rol("SISTEMA", Set.of()));

    private String username;
    private Rol rol;

    public Usuario(String username, Rol rol) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("El username es obligatorio");
        }
        this.username = username;
        this.rol = Objects.requireNonNull(rol, "rol");
    }

    public boolean tenesPermiso(Permiso permiso) {
        return rol.tenesPermiso(permiso);
    }

    public boolean esSistema() {
        return NOMBRE_SISTEMA.equals(username);
    }

    public String username() {
        return username;
    }

    public Rol rol() {
        return rol;
    }

    @Override
    public boolean equals(Object otro) {
        return otro instanceof Usuario usuario && username.equals(usuario.username);
    }

    @Override
    public int hashCode() {
        return username.hashCode();
    }

    @Override
    public String toString() {
        return username;
    }
}
