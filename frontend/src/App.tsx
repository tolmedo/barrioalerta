import { Navigate, Route, Routes } from 'react-router-dom'
import { Box, Container } from '@mui/material'

import { Header } from './components/headers/Header'
import { EnConstruccion } from './components/layout/EnConstruccion'
import { NoAutorizado } from './components/layout/NoAutorizado'
import { PrivateRoute } from './components/layout/PrivateRoute'

import { Home } from './pages/home/Home'
import { Login } from './pages/login/Login'

import { secciones } from './utils/secciones'

export function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" sx={{ py: 3, flexGrow: 1 }}>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Una sección por rol */}
          {secciones.map((seccion) => (
            <Route
              key={seccion.ruta}
              path={seccion.ruta}
              element={
                <PrivateRoute rolRequerido={seccion.rol}>
                  <EnConstruccion rol={seccion.titulo} hito={seccion.hito} pantallas={seccion.pantallas} />
                </PrivateRoute>
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  )
}
