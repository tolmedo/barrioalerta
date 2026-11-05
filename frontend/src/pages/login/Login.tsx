import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, Divider, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { usePeticion } from '../../hooks/usePeticion'
import { seccionDelRol } from '../../utils/secciones'
import { CLAVE_DEMO, usuariosDemo } from '../../utils/usuariosDemo'

export function Login() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const { cargando, error, ejecutar } = usePeticion()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (usuario) {
    return <Navigate to={seccionDelRol(usuario.rol).ruta} replace />
  }

  const ingresar = async (nombreDeUsuario: string, clave: string) => {
    const logueado = await ejecutar(() => login(nombreDeUsuario, clave), 'No se pudo iniciar sesión.')
    if (logueado) {
      navigate(seccionDelRol(logueado.rol).ruta, { replace: true })
    }
  }

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    ingresar(username, password)
  }

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto' }}>
      <Card component="section" aria-labelledby="titulo-login">
        <CardContent>
          <Typography id="titulo-login" variant="h5" component="h1" gutterBottom>
            Ingresar
          </Typography>

          <Stack component="form" spacing={2} onSubmit={enviar} noValidate>
            <TextField
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" disabled={cargando || !username || !password}>
              {cargando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }}>Acceso rápido (demo)</Divider>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {usuariosDemo.map((demo) => (
              <Button
                key={demo.username}
                variant="outlined"
                disabled={cargando}
                onClick={() => ingresar(demo.username, CLAVE_DEMO)}
                sx={{ flexDirection: 'column', textTransform: 'none' }}
              >
                <span>{demo.nombre}</span>
                <Typography component="span" variant="caption" color="text.secondary">
                  {demo.descripcion}
                </Typography>
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
