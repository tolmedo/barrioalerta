import { Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material'

interface Props {
  rol: string
  hito: string
  pantallas: string[]
}

export function EnConstruccion({ rol, hito, pantallas }: Props) {
  return (
    <Card component="section" aria-labelledby="titulo-seccion">
      <CardContent>
        <Typography id="titulo-seccion" variant="h5" component="h1" gutterBottom>
          {rol}
        </Typography>
        <Typography color="text.secondary">
          En construcción (hito {hito}). Pantallas previstas según el lineamiento:
        </Typography>
        <List dense>
          {pantallas.map((pantalla) => (
            <ListItem key={pantalla}>
              <ListItemText primary={pantalla} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
