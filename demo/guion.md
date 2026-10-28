# Guion de la demo (borrador v0)

| Tiempo | Quién | Acción exacta | Qué se dice (concepto) | Respaldo si falla |
|---|---|---|---|---|
| 0:00–1:00 | I1 | Slide del problema → landing pública con el mapa | Problema, actores, propuesta | Slide con captura del mapa |
| 1:00–2:30 | I7 | Slides de componentes y despliegue | Monolito modular vs microservicios (D2) | — |
| 2:30–4:00 | I5 | Login rápido **Vecina Ana** → mapa → toca el marcador de **#101** (bache en Av. Medrano 950) → **Sumarme** → sube el contador de adhesiones | Adherir en lugar de duplicar; prevención de errores (Nielsen) | Abrir #101 ya adherido |
| 4:00–5:00 | I5 | Reportar **Luminaria** en Bulnes y Díaz Vélez (3 pasos, foto del seed) → queda *Reportado* | Criterios de UI de la E4: microcopy, toasts, validación | Usar #102 |
| 5:00–6:30 | I2 | Login **Admin** → mostrar la importación de `vecinos.csv` (10.000 filas) con su reporte de filas válidas y erróneas → login **Operadora Carla** → bandeja → validar la luminaria | **Template Method** (importación); **State** (solo se ofrecen las acciones válidas) | Captura del reporte de importación |
| 6:30–8:00 | I3 → I4 | Asignar: columnas Cercanía (Norte) vs Menor carga (Luminarias) → asignar → campana de Ana: "Tu reclamo fue asignado" + bandeja simulada | **Strategy ≠ State**; **Observer** + Adapter | Usar #103 ya asignado |
| 8:00–9:30 | I3 → I1 | Vista mobile de la cuadrilla → Iniciar → Resolver con `luminaria-ok.jpg` → historial (quién, qué, cuándo) | **State**, auditoría, no repudio | Usar #104 ya resuelto |
| 9:30–10:45 | I7 → I4 | Panel demo: reloj "10:00" → **+48 h** → #110 aparece **escalado** + notificación | Tarea programada y asincronía; `Reloj` inyectado (DIP) | "Ejecutar control de SLA" sobre #111 |
| 10:45–12:00 | I6 | Tests verdes (la tabla de transiciones) y resultados de las pruebas con usuarios | U8: verificación vs validación | Capturas en la slide |
| 12:00–12:30 | I1 | Cierre y evolución | — | — |
| 12:30–15:00 | Todos | Tolerancia | — | — |

## Datos que tiene que garantizar el seed

- `#101`: Bache, Av. Medrano 950, *Validado*, 2 adhesiones.
- `#102`: Luminaria, *Validado* (respaldo del paso 4:00).
- `#103`: Luminaria, *Asignado* a Luminarias (respaldo de 6:30).
- `#104`: Luminaria, *Resuelto* con foto (respaldo de 8:00).
- `#110`: Bache, *Validado* hoy a las 10:00 con SLA de 48 h.
- `#111`: Bache, ya vencido.
- Cuadrillas con cargas 4 / 1 / 2, para que **las dos estrategias de asignación propongan cuadrillas distintas**.
