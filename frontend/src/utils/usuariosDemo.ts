/** Acceso rápido para la demo: los usuarios que carga `npm run seed` en el backend, todos con la misma contraseña. */
export const CLAVE_DEMO = import.meta.env.VITE_CLAVE_DEMO ?? 'demo2026'

export const usuariosDemo = [
  { username: 'vecina.ana', nombre: 'Ana', descripcion: 'Vecina' },
  { username: 'vecino.bruno', nombre: 'Bruno', descripcion: 'Vecino' },
  { username: 'operadora.carla', nombre: 'Carla', descripcion: 'Operadora' },
  { username: 'cuadrilla.norte.1', nombre: 'Norte', descripcion: 'Cuadrilla' },
  { username: 'cuadrilla.luminarias.1', nombre: 'Luminarias', descripcion: 'Cuadrilla' },
  { username: 'admin', nombre: 'Admin', descripcion: 'Administrador' },
]
