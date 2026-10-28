import { useCallback, useState } from 'react'
import { isAxiosError } from 'axios'

/** Ejecuta una llamada a la API y deja disponibles el estado de carga y el mensaje de error del backend. */
export function usePeticion(cargandoInicial = false) {
  const [cargando, setCargando] = useState(cargandoInicial)
  const [error, setError] = useState('')

  const ejecutar = useCallback(async <T>(llamada: () => Promise<T>, mensajeError = 'Ocurrió un error.'): Promise<T | null> => {
    try {
      setCargando(true)
      setError('')
      return await llamada()
    } catch (err) {
      const mensajeDelBackend = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined
      setError(mensajeDelBackend || (err instanceof Error ? err.message : '') || mensajeError)
      return null
    } finally {
      setCargando(false)
    }
  }, [])

  return { cargando, error, setError, ejecutar }
}
