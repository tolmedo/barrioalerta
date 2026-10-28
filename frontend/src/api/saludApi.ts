import apiClient from './apiClient'

export interface Salud {
  mensaje: string
  horaDelSistema: string
}

export const obtenerSalud = async (): Promise<Salud> => {
  const response = await apiClient.get<Salud>('/salud')
  return response.data
}
