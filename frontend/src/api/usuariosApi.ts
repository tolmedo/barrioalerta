import apiClient from './apiClient'

export type Rol = 'VECINO' | 'OPERADOR' | 'CUADRILLA' | 'ADMIN'

export interface UsuarioSesion {
  id: number
  username: string
  rol: Rol
  permisos: string[]
  vecino: { id: number; nombre: string; barrio: string } | null
}

export interface RespuestaLogin {
  token: string
  usuario: UsuarioSesion
}

export const login = async (username: string, password: string): Promise<RespuestaLogin> => {
  const response = await apiClient.post<RespuestaLogin>('/usuarios/login', { username, password })
  return response.data
}
