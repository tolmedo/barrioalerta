package ar.utn.barrioalerta.incidentes.dominio;

import ar.utn.barrioalerta.identidad.dominio.TipoCanal;
import ar.utn.barrioalerta.identidad.dominio.Usuario;
import java.util.Objects;

/** Actor con relaciones propias en el dominio (reporta, adhiere, reabre), por eso es una entidad. */
public class Vecino {

    private String nombre;
    private Usuario usuario;
    private String barrio;
    private TipoCanal canalPreferido;

    public Vecino(String nombre, Usuario usuario, String barrio, TipoCanal canalPreferido) {
        this.nombre = Objects.requireNonNull(nombre, "nombre");
        this.usuario = Objects.requireNonNull(usuario, "usuario");
        this.barrio = barrio;
        this.canalPreferido = canalPreferido == null ? TipoCanal.IN_APP : canalPreferido;
    }

    public void cambiarCanalPreferido(TipoCanal canal) {
        this.canalPreferido = Objects.requireNonNull(canal, "canal");
    }

    public String nombre() {
        return nombre;
    }

    public Usuario usuario() {
        return usuario;
    }

    public String barrio() {
        return barrio;
    }

    public TipoCanal canalPreferido() {
        return canalPreferido;
    }
}
