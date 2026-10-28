# Justificaciones de diseño — BarrioAlerta (v0)

| Decisión | Ganamos | Perdemos |
|---|---|---|
| **Aplicación multimódulo** (un solo proceso, módulos por carpeta: incidentes, asignación, notificaciones, identidad, importación) | Una sola cosa que arrancar en la demo; los módulos dependen en un solo sentido | Escalado independiente. No hay carga que lo pida, y sin ciclos entre módulos se puede extraer un servicio después. |
| **Modelo de dominio rico**: las reglas viven en `Incidente` y sus estados | Las reglas están en un solo lugar y se testean sin base de datos ni HTTP | Más clases. Se justifica porque el ciclo de vida tiene 8 estados y reglas por estado. |
| **State** para el ciclo de vida del incidente | Agregar o cambiar un estado no toca a los demás; las transiciones inválidas se rechazan solas | Más clases que un `switch`. El `switch` quedaría repetido en cada acción (8 acciones × 8 estados). |
| **Strategy** para proponer cuadrillas | Un criterio nuevo es una clase nueva, sin modificar las existente | Una indirección más. |
| **Eventos de dominio** para notificar | El incidente no conoce a Notificaciones; un canal que falla no revierte la operación | Si el proceso se cae entre guardar y notificar, se pierde un aviso |
| **Reloj inyectado** (`Reloj`, y `RelojDeDemo` en la demo) | La demo es determinística: el SLA vence cuando lo decidimos, no porque pasó el tiempo real | Hay que pasar `ahora` como parámetro a los métodos del dominio. |
| **Persistencia políglota**: Notificaciones en MongoDB con Mongoose; el resto en PostgreSQL con ORM | Cada notificación es un documento independiente que se agrega y se lee por destinatario; la campana se arma sin consultar PostgreSQL | Una base más que tiene que estar levantada en la demo, y sin claves foráneas entre las dos bases |
| **SPA React** | Interactividad del mapa, de la bandeja y del asistente de reporte; la API REST es el único contrato | Primera carga y SEO, que no aplican a una herramienta con login |
