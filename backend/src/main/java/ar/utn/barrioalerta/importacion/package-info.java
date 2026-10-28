/**
 * Importación masiva desde CSV (≥ 10.000 filas), usada también para cargar los históricos del seed.
 * <p>
 * Dueño: I7. Pendiente H3: {@code ImportadorCsv<T>} con Template Method ({@code importar()} fijo;
 * {@code validarFila()} y {@code mapear()} abstractos) y las variantes de incidentes históricos y
 * cuadrillas. Endpoint: {@code POST /api/importaciones}.
 */
package ar.utn.barrioalerta.importacion;
