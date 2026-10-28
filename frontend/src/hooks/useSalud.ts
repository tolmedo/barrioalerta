import { useEffect, useState } from 'react'
import { obtenerSalud, type Salud } from '../api/saludApi'
import { usePeticion } from './usePeticion'

export const useSalud = () => {
  const [salud, setSalud] = useState<Salud | null>(null)
  const { cargando, error, ejecutar } = usePeticion(true)

  useEffect(() => {
    ejecutar(obtenerSalud, 'No se pudo conectar con la API.').then(setSalud)
  }, [ejecutar])

  return { salud, cargando, error }
}
