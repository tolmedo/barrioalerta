import { createTheme } from '@mui/material/styles'

/**
 * Tokens de diseño (lineamiento, sección 7.3). Los colores de estado se acompañan siempre de
 * texto o ícono: el estado nunca se comunica solo con color (WCAG).
 */
export const coloresDeEstado = {
  REPORTADO: '#616161',
  VALIDADO: '#1565c0',
  ASIGNADO: '#6a1b9a',
  EN_CURSO: '#b26a00',
  RESUELTO: '#2e7d32',
  CERRADO: '#1b5e20',
  RECHAZADO: '#c62828',
  DUPLICADO: '#757575',
} as const

export type NombreEstado = keyof typeof coloresDeEstado

export const tema = createTheme({
  palette: {
    primary: { main: '#00695c' },
    secondary: { main: '#ef6c00' },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  typography: {
    fontFamily: 'Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  components: {
    // Zona clickeable mínima de 48 px (Ref. DonaTrack E4, accesibilidad táctil).
    MuiButton: { styleOverrides: { root: { minHeight: 48 } } },
    MuiIconButton: { styleOverrides: { root: { minWidth: 48, minHeight: 48 } } },
  },
})
