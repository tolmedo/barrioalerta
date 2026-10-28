import { useEffect, useState } from 'react'
import { Alert, Box, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { obtener, type Salud } from '../api'
import { MapaBarrio } from '../componentes/MapaBarrio'

type EstadoApi =
  | { tipo: 'cargando' }
  | { tipo: 'conectada'; salud: Salud }
  | { tipo: 'error'; mensaje: string }

export function Landing() {
  const [api, setApi] = useState<EstadoApi>({ tipo: 'cargando' })

  useEffect(() => {
    obtener<Salud>('/api/salud')
      .then((salud) => setApi({ tipo: 'conectada', salud }))
      .catch((error: Error) => setApi({ tipo: 'error', mensaje: error.message }))
  }, [])

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Reportá problemas de tu barrio y seguí su resolución
        </Typography>
        <Typography color="text.secondary">
          Baches, luminarias apagadas, basurales o árboles caídos: el municipio los prioriza, asigna una cuadrilla
          y te avisa en cada paso.
        </Typography>
      </Box>

      <Box aria-live="polite">
        {api.tipo === 'cargando' && <Skeleton variant="rounded" width={220} height={32} />}
        {api.tipo === 'conectada' && (
          <Chip color="success" label={`API conectada: ${api.salud.mensaje}`} />
        )}
        {api.tipo === 'error' && (
          <Alert severity="warning">
            No se pudo conectar con la API ({api.mensaje}). ¿Está levantado el backend en el puerto 8080?
          </Alert>
        )}
      </Box>

      <MapaBarrio />
    </Stack>
  )
}
