/** Una ruta por rol (lineamiento, sección 7.1). Profundidad máxima de navegación: 3 niveles. */
export const secciones = [
  { ruta: '/vecino', titulo: 'Vecino', hito: 'H1', pantallas: ['Mapa del barrio (sumarse a un reclamo)', 'Reportar (3 pasos)', 'Mis reportes', 'Detalle con historial'] },
  { ruta: '/operador', titulo: 'Operador', hito: 'H1–H2', pantallas: ['Bandeja por estado', 'Asignación con propuestas'] },
  { ruta: '/cuadrilla', titulo: 'Cuadrilla', hito: 'H1', pantallas: ['Mis tareas', 'Resolver con foto'] },
  { ruta: '/admin', titulo: 'Admin', hito: 'H3', pantallas: ['Tipos y SLA', 'Cuadrillas', 'Importar vecinos (CSV)', 'Notificaciones simuladas', 'Panel de demo'] },
]
