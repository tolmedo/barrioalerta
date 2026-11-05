import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Rol } from '../../api/usuariosApi'
import { useAuth } from '../../context/AuthContext'

interface Props {
  children: ReactNode
  rolRequerido?: Rol
}

export function PrivateRoute({ children, rolRequerido }: Props) {
  const { usuario } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/no-autorizado" replace />
  }

  return children
}
