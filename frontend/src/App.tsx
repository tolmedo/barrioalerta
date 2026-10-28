import { Route, Routes } from 'react-router-dom'
import { Box, Container } from '@mui/material'

import { Header } from './components/headers/Header'
import { EnConstruccion } from './components/layout/EnConstruccion'

import { Home } from './pages/home/Home'

import { secciones } from './utils/secciones'

export function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" sx={{ py: 3, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
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
