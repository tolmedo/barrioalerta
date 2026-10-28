package ar.utn.barrioalerta.identidad.dominio;

/**
 * Permisos del sistema. Se modelan como enum (lista cerrada conocida al compilar); la limitación es
 * que agregar uno requiere recompilar, aceptable para este alcance (C04).
 */
public enum Permiso {
    REPORTAR_INCIDENTE,
    ADHERIR_INCIDENTE,
    GESTIONAR_INCIDENTES,
    ASIGNAR_CUADRILLAS,
    EJECUTAR_TRABAJOS,
    ADMINISTRAR_CONFIGURACION,
    IMPORTAR_DATOS,
    OPERAR_DEMO
}
