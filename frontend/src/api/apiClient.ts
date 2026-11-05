import axios from 'axios'

/** Cliente HTTP de toda la app. En desarrollo, Vite redirige /api al backend (vite.config.ts). */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Si el token venció o es inválido, se cierra la sesión y se vuelve al login.
// El 401 del propio login (contraseña incorrecta) lo muestra la pantalla de login.
apiClient.interceptors.response.use(undefined, (error) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.url !== '/usuarios/login') {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.assign('/login')
  }
  return Promise.reject(error)
})

export default apiClient
