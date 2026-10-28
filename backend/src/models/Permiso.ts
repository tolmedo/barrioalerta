/**
 * Permisos del sistema. Se modelan como enum (lista cerrada conocida al compilar); la limitación es
 * que agregar uno requiere cambiar el código, aceptable para este alcance (C04).
 */
export enum Permiso {
  REPORTAR_INCIDENTE = 'REPORTAR_INCIDENTE',
  ADHERIR_INCIDENTE = 'ADHERIR_INCIDENTE',
  GESTIONAR_INCIDENTES = 'GESTIONAR_INCIDENTES',
  ASIGNAR_CUADRILLAS = 'ASIGNAR_CUADRILLAS',
  EJECUTAR_TRABAJOS = 'EJECUTAR_TRABAJOS',
  ADMINISTRAR_CONFIGURACION = 'ADMINISTRAR_CONFIGURACION',
  IMPORTAR_DATOS = 'IMPORTAR_DATOS',
  OPERAR_DEMO = 'OPERAR_DEMO',
}

/** Medio por el que una persona prefiere recibir notificaciones (enunciado E1: email, SMS y WhatsApp). */
export enum TipoCanal {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}
