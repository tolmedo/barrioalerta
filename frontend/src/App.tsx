import { Link as RouterLink, Route, Routes } from 'react-router-dom'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Landing } from './paginas/Landing'
import { EnConstruccion } from './paginas/EnConstruccion'

/** Una ruta por rol (lineamiento, sección 7.1). Profundidad máxima de navegación: 3 niveles. */
const secciones = [
  { ruta: '/vecino', titulo: 'Vecino', hito: 'H1', pantallas: ['Mapa del barrio (sumarse a un reclamo)', 'Reportar (3 pasos)', 'Mis reportes', 'Detalle con historial'] },
  { ruta: '/operador', titulo: 'Operador', hito: 'H1–H2', pantallas: ['Bandeja por estado', 'Asignación con propuestas'] },
  { ruta: '/cuadrilla', titulo: 'Cuadrilla', hito: 'H1', pantallas: ['Mis tareas', 'Resolver con foto'] },
  { ruta: '/admin', titulo: 'Admin', hito: 'H3', pantallas: ['Tipos y SLA', 'Cuadrillas', 'Importar vecinos (CSV)', 'Notificaciones simuladas', 'Panel de demo'] },
]

export function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      <Container component="main" sx={{ py: 3, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          {secciones.map((seccion) => (
            <Route
              key={seccion.ruta}
              path={seccion.ruta}
              element={<EnConstruccion rol={seccion.titulo} hito={seccion.hito} pantallas={seccion.pantallas} />}
            />
          ))}
        </Routes>
      </Container>
    </Box>
  )
}
