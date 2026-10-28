/** Cliente HTTP mínimo. En H1 se agrega el token JWT y el manejo uniforme de ErrorRespuesta. */

export interface Salud {
  mensaje: string
  horaDelSistema: string
}

export interface ErrorRespuesta {
  codigo: string
  mensaje: string
  detalles: string[]
}

export async function obtener<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(ruta, { headers: { Accept: 'application/json' } })
  if (!respuesta.ok) {
    const error = (await respuesta.json().catch(() => null)) as ErrorRespuesta | null
    throw new Error(error?.mensaje ?? `Error ${respuesta.status}`)
  }
  return (await respuesta.json()) as T
}
