import { Link as RouterLink } from 'react-router-dom'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { secciones } from '../../utils/secciones'

export function Header() {
  return (
    <AppBar position="static" component="header">
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          BarrioAlerta
        </Typography>
        <Box component="nav" aria-label="Secciones por rol" sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {secciones.map((seccion) => (
            <Button key={seccion.ruta} color="inherit" component={RouterLink} to={seccion.ruta}>
              {seccion.titulo}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
