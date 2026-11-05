import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { seccionDelRol } from '../../utils/secciones'

export function Header() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const salir = () => {
    logout()
    navigate('/')
  }

  return (
    <AppBar position="static" component="header">
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          BarrioAlerta
        </Typography>
        <Box component="nav" aria-label="Sesión" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {usuario ? (
            <>
              <Button color="inherit" component={RouterLink} to={seccionDelRol(usuario.rol).ruta}>
                {usuario.vecino?.nombre ?? usuario.username} · {seccionDelRol(usuario.rol).titulo}
              </Button>
              <Button color="inherit" variant="outlined" onClick={salir}>
                Salir
              </Button>
            </>
          ) : (
            <Button color="inherit" variant="outlined" component={RouterLink} to="/login">
              Ingresar
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
