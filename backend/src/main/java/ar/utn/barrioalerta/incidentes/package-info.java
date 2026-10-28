/**
 * Núcleo del sistema: agregado {@code Incidente} con su ciclo de vida (patrón State) y auditoría,
 * adhesiones, SLA, cuadrillas, priorización (Strategy) y los eventos de dominio que consumen otros
 * módulos.
 * <p>
 * Dueños: I1 (agregado, estados, auditoría) e I2 (duplicados y priorización).
 * Pendiente H1: mapeo JPA, repositorio, servicio de aplicación y API REST.
 * Pendiente H2: {@code DetectorDeDuplicados} y las estrategias concretas de priorización.
 */
package ar.utn.barrioalerta.incidentes;
