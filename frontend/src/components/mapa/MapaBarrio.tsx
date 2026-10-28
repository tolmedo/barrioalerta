import { Box, Typography } from '@mui/material'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'

/** UTN FRBA, sede Medrano: centro del área de la demo (Almagro, Balvanera, Boedo). */
const UTN_MEDRANO: [number, number] = [-34.5986, -58.4202]

/**
 * Mapa base. TODO H1: reemplazar las teselas online de OpenStreetMap por un
 * extracto local de CABA en PMTiles para que la demo funcione sin internet.
 */
export function MapaBarrio() {
  return (
    <Box component="section" aria-labelledby="titulo-mapa">
      <Typography id="titulo-mapa" variant="h6" component="h2" gutterBottom>
        Incidentes en el barrio
      </Typography>
      <Box sx={{ height: { xs: 320, md: 480 }, borderRadius: 2, overflow: 'hidden' }}>
        <MapContainer center={UTN_MEDRANO} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker center={UTN_MEDRANO} radius={10} pathOptions={{ color: '#00695c' }}>
            <Popup>UTN FRBA — sede Medrano</Popup>
          </CircleMarker>
        </MapContainer>
      </Box>
    </Box>
  )
}
