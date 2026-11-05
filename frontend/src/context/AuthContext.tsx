import { createContext, useContext, useState, type ReactNode } from 'react'
import { login as loginApi, type UsuarioSesion } from '../api/usuariosApi'

interface ValorAuth {
  usuario: UsuarioSesion | null
  estaLogueado: boolean
  login: (username: string, password: string) => Promise<UsuarioSesion>
  logout: () => void
}

const AuthContext = createContext<ValorAuth | null>(null)

/** La sesión sobrevive a recargar la página: el token y el usuario quedan en localStorage. */
const usuarioGuardado = (): UsuarioSesion | null => {
  try {
    const guardado = localStorage.getItem('usuario')
    return guardado && localStorage.getItem('token') ? (JSON.parse(guardado) as UsuarioSesion) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(usuarioGuardado)

  const login = async (username: string, password: string) => {
    const { token, usuario } = await loginApi(username, password)

    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    setUsuario(usuario)

    return usuario
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, estaLogueado: !!usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const valor = useContext(AuthContext)
  if (!valor) {
    throw new Error('useAuth se usa dentro de un AuthProvider')
  }
  return valor
}
