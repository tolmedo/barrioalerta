import type { Rol } from '../api/usuariosApi'

/** Una sección por rol. Profundidad máxima de navegación: 3 niveles. */
export const secciones: { ruta: string; titulo: string; rol: Rol; hito: string; pantallas: string[] }[] = [
  { ruta: '/vecino', titulo: 'Vecino', rol: 'VECINO', hito: 'H1', pantallas: ['Mapa del barrio (sumarse a un reclamo)', 'Reportar (3 pasos)', 'Mis reportes', 'Detalle con historial'] },
  { ruta: '/operador', titulo: 'Operador', rol: 'OPERADOR', hito: 'H1–H2', pantallas: ['Bandeja por estado', 'Asignación con propuestas'] },
  { ruta: '/cuadrilla', titulo: 'Cuadrilla', rol: 'CUADRILLA', hito: 'H1', pantallas: ['Mis tareas', 'Resolver con foto'] },
  { ruta: '/admin', titulo: 'Admin', rol: 'ADMIN', hito: 'H3', pantallas: ['Tipos y SLA', 'Cuadrillas', 'Importar vecinos (CSV)', 'Notificaciones simuladas', 'Panel de demo'] },
]

/** Adónde va cada usuario después de loguearse. */
export const seccionDelRol = (rol: Rol) => secciones.find((seccion) => seccion.rol === rol)!
