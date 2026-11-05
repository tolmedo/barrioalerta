import { Link as RouterLink } from 'react-router-dom'
import { Alert, Button, Stack } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { seccionDelRol } from '../../utils/secciones'

export function NoAutorizado() {
  const { usuario } = useAuth()

  return (
    <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto' }}>
      <Alert severity="warning">Tu usuario no tiene acceso a esta sección.</Alert>
      <Button variant="contained" component={RouterLink} to={usuario ? seccionDelRol(usuario.rol).ruta : '/login'}>
        Ir a mi sección
      </Button>
    </Stack>
  )
}
