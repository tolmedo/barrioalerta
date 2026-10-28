import { Alert, Box, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { MapaBarrio } from '../../components/mapa/MapaBarrio'
import { useSalud } from '../../hooks/useSalud'

export function Home() {
  const { salud, cargando, error } = useSalud()

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Reportá problemas de tu barrio y seguí su resolución
        </Typography>
        <Typography color="text.secondary">
          Baches, luminarias apagadas, basurales o árboles caídos: el municipio los valida, asigna una cuadrilla
          y te avisa en cada paso.
        </Typography>
      </Box>

      <Box aria-live="polite">
        {cargando && <Skeleton variant="rounded" width={220} height={32} />}
        {salud && <Chip color="success" label={`API conectada: ${salud.mensaje}`} />}
        {error && (
          <Alert severity="warning">
            No se pudo conectar con la API ({error}). ¿Está levantado el backend en el puerto 8080?
          </Alert>
        )}
      </Box>

      <MapaBarrio />
    </Stack>
  )
}
