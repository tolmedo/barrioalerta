import axios from 'axios'

/**
 * Cliente HTTP de toda la app. En desarrollo, Vite redirige /api al backend (vite.config.ts).
 * En H1 se agrega un interceptor que manda el token JWT.
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
