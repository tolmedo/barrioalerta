/**
 * Reacciona a los eventos de dominio y avisa a los interesados (reportante y adherentes).
 * <p>
 * Dueño: I4. Pendiente H3:
 * <ul>
 *   <li>{@code ServicioNotificaciones} (Facade): destinatarios, plantilla, persistencia y envío.</li>
 *   <li>{@code CanalNotificacion} con adaptadores {@code CanalInApp}, {@code CanalEmailSimulado} y
 *       {@code CanalWhatsAppSimulado} (Adapter), elegidos por {@code CanalNotificacionFactory}.</li>
 *   <li>Listener con {@code @TransactionalEventListener(phase = AFTER_COMMIT)} y {@code @Async}.</li>
 * </ul>
 */
package ar.utn.barrioalerta.notificaciones;
