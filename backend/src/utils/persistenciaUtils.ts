/** Para guardar una referencia hace falta que el objeto ya esté en la base (que tenga id). */
export const exigirId = (entidad: { id?: number }, descripcion: string): number => {
  if (entidad.id === undefined) {
    throw new Error(`${descripcion} todavía no está guardado`);
  }
  return entidad.id;
};
