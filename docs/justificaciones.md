# Justificaciones de diseño — BarrioAlerta (v0)

Es el entregable "Justificaciones de Diseño" que pide el enunciado en las entregas 1 a 4. Cada decisión dice qué ganamos y qué perdemos. El detalle está en la sección 5 del [lineamiento](../../LINEAMIENTO_TP_DSI.md).

| Decisión | Ganamos | Perdemos (y por qué está bien) |
|---|---|---|
| **Aplicación multimódulo** (un solo proceso, módulos por carpeta: incidentes, asignación, notificaciones, identidad, importación) | Una sola cosa que arrancar en la demo; los módulos dependen en un solo sentido | Escalado independiente. No hay carga que lo pida, y sin ciclos entre módulos se puede extraer un servicio después. |
| **Modelo de dominio rico** (pregunta de discusión de la E1): las reglas viven en `Incidente` y sus estados | Las reglas están en un solo lugar y se testean sin base de datos ni HTTP | Más clases que un modelo anémico. Se justifica porque el ciclo de vida tiene 8 estados y reglas por estado. |
| **State** para el ciclo de vida del incidente | Agregar o cambiar un estado no toca a los demás; las transiciones inválidas se rechazan solas | Más clases que un `switch`. El `switch` quedaría repetido en cada acción (8 acciones × 8 estados). |
| **Strategy** para proponer cuadrillas (los dos algoritmos que pide la E2) | Un criterio nuevo es una clase nueva, sin modificar las existentes (enunciado: "incorporar nuevos algoritmos en el futuro") | Una indirección más. |
| **Eventos de dominio** para notificar | El incidente no conoce a Notificaciones; un canal que falla no revierte la operación | Si el proceso se cae entre guardar y notificar, se pierde un aviso. La evolución es Transactional Outbox (bonus de la E6). |
| **Reloj inyectado** (`Reloj`, y `RelojDeDemo` en la demo) | La demo es determinística: el SLA vence cuando lo decidimos, no porque pasó el tiempo real | Hay que pasar `ahora` como parámetro a los métodos del dominio. |
| **TypeScript** en back y front | Un solo lenguaje para los 7 integrantes; los tipos e interfaces permiten mostrar que el código coincide con el diagrama de clases | Menos ejemplos de la cátedra para reutilizar, porque el material está en Java. |
| **Persistencia políglota** (E4): Notificaciones en MongoDB con Mongoose; el resto en PostgreSQL con ORM | Cada notificación es un documento independiente que se agrega y se lee por destinatario; la campana se arma sin consultar PostgreSQL | Una base más que tiene que estar levantada en la demo, y sin claves foráneas entre las dos bases. Es la pregunta de discusión de la E4. |
| **SPA React** en lugar de motor de plantillas (E5 pide SSR; aceptado por el docente) | Interactividad del mapa, de la bandeja y del asistente de reporte; la API REST es el único contrato | Primera carga y SEO, que no aplican a una herramienta con login. Es la pregunta de discusión de la E5. |
