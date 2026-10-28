# Guion de la demo (borrador v0)

**Dueño:** I7. Fuente: sección 10.1 del lineamiento. **Objetivo:** 12 minutos + 3 de margen. Todo se construye para este guion; si una funcionalidad no aparece acá, no es prioridad.

> **Regla:** si un paso falla, **no se reintenta en vivo**. Se sigue desde el incidente de respaldo, que ya está en el estado siguiente.

| Tiempo | Quién | Acción exacta | Qué se dice (concepto) | Respaldo si falla |
|---|---|---|---|---|
| 0:00–1:00 | I1 | Slide del problema → landing pública con el mapa | Problema, actores, propuesta | Slide con captura del mapa |
| 1:00–2:30 | I7 | Slides de componentes y despliegue | Monolito modular vs microservicios (D2) | — |
| 2:30–4:00 | I5 | Login rápido **Vecina Ana** → Reportar → Bache → pin en **Av. Medrano 940** → foto `bache-medrano.jpg` → aparece "1 reclamo parecido a 15 m" → **Sumarme** | Algoritmo de duplicados; prevención de errores (Nielsen) | Abrir #101 ya adherido |
| 4:00–5:00 | I5 → I2 | Reportar **Luminaria** en Bulnes y Díaz Vélez → queda *Reportado* | — | Usar #102 |
| 5:00–6:30 | I2 | Login **Operadora Carla** → bandeja → validar la luminaria → Ranking: cambiar "Ponderada" ↔ "Riesgo SLA" | **Strategy** (priorización), OCP | Captura del ranking en ambas estrategias |
| 6:30–8:00 | I3 → I4 | Asignar: columnas Cercanía (Norte) vs Menor carga (Luminarias) → asignar → campana de Ana: "Tu reclamo fue asignado" + bandeja simulada | **Strategy ≠ State**; **Observer** + Adapter | Usar #103 ya asignado |
| 8:00–9:30 | I3 → I1 | Vista mobile de la cuadrilla → Iniciar → Resolver con `luminaria-ok.jpg` → historial (quién, qué, cuándo) | **State**, auditoría, no repudio | Usar #104 ya resuelto |
| 9:30–10:45 | I7 → I4 | Panel demo: reloj "10:00" → **+48 h** → #110 aparece **escalado** + notificación | Tarea programada y asincronía; `Reloj` inyectado (DIP) | "Ejecutar control de SLA" sobre #111 |
| 10:45–12:00 | I6 | Tests verdes (la tabla de transiciones) y resultados de las pruebas con usuarios | U8: verificación vs validación | Capturas en la slide |
| 12:00–12:30 | I1 | Cierre y evolución | — | — |
| 12:30–15:00 | Todos | Preguntas: responde el dueño del tema (sección 9 del lineamiento) | — | — |

## Datos que tiene que garantizar el seed

- `#101`: Bache, Av. Medrano 950, *Validado*, 2 adhesiones.
- `#102`: Luminaria, *Validado* (respaldo del paso 4:00).
- `#103`: Luminaria, *Asignado* a Luminarias (respaldo de 6:30).
- `#104`: Luminaria, *Resuelto* con foto (respaldo de 8:00).
- `#110`: Bache, *Validado* hoy a las 10:00 con SLA de 48 h.
- `#111`: Bache, ya vencido.
- Cuadrillas con cargas 4 / 1 / 2, para que **las dos estrategias de asignación propongan cuadrillas distintas**.
