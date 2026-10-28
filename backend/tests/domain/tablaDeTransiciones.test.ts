import { describe, expect, it } from 'vitest';
import { Accion } from '../../src/models/Accion.js';
import { EstadoIncidente, type NombreEstado, TransicionInvalidaError } from '../../src/models/EstadoIncidente.js';
import type { Incidente } from '../../src/models/Incidente.js';
import { ANA, INICIO, MIEMBRO_NORTE, NORTE, OPERADORA, evidencia, unBache } from './escenario.js';

/**
 * El diagrama de estados (docs/diagramas/estados-incidente.md) convertido en test: cada fila de
 * TRANSICIONES es una flecha del diagrama. Todo lo que no figura en la tabla debe ser rechazado.
 * Si se cambia el diagrama, se cambia esta tabla en el mismo PR.
 */
const ESTADOS: NombreEstado[] = [
  'REPORTADO',
  'VALIDADO',
  'ASIGNADO',
  'EN_CURSO',
  'RESUELTO',
  'CERRADO',
  'RECHAZADO',
  'DUPLICADO',
];

/** estado de origen → (acción → estado de destino). */
const TRANSICIONES: Partial<Record<NombreEstado, Partial<Record<Accion, NombreEstado>>>> = {
  REPORTADO: {
    [Accion.VALIDAR]: 'VALIDADO',
    [Accion.RECHAZAR]: 'RECHAZADO',
    [Accion.MARCAR_DUPLICADO]: 'DUPLICADO',
  },
  VALIDADO: { [Accion.ASIGNAR]: 'ASIGNADO' },
  ASIGNADO: { [Accion.ASIGNAR]: 'ASIGNADO', [Accion.INICIAR_TRABAJO]: 'EN_CURSO' },
  EN_CURSO: { [Accion.RESOLVER]: 'RESUELTO' },
  RESUELTO: { [Accion.CERRAR]: 'CERRADO', [Accion.REABRIR]: 'VALIDADO' },
};

const ACCIONES = Object.values(Accion);

const transicionesValidas = ESTADOS.flatMap((origen) =>
  ACCIONES.flatMap((accion) => {
    const destino = TRANSICIONES[origen]?.[accion];
    return destino ? [{ origen, accion, destino }] : [];
  }),
);

const transicionesInvalidas = ESTADOS.flatMap((origen) =>
  ACCIONES.filter((accion) => !TRANSICIONES[origen]?.[accion]).map((accion) => ({ origen, accion })),
);

/** Ejecuta la acción con argumentos válidos, para que solo pueda fallar por el estado. */
function ejecutar(accion: Accion, incidente: Incidente): void {
  switch (accion) {
    case Accion.VALIDAR:
      return incidente.validar(OPERADORA, INICIO);
    case Accion.RECHAZAR:
      return incidente.rechazar(OPERADORA, 'No corresponde', INICIO);
    case Accion.MARCAR_DUPLICADO:
      return incidente.marcarDuplicadoDe(unBache().reportado(), OPERADORA, INICIO);
    case Accion.ASIGNAR:
      return incidente.asignar(NORTE, OPERADORA, INICIO);
    case Accion.INICIAR_TRABAJO:
      return incidente.iniciarTrabajo(MIEMBRO_NORTE, INICIO);
    case Accion.RESOLVER:
      return incidente.resolver(MIEMBRO_NORTE, evidencia(INICIO), INICIO);
    case Accion.REABRIR:
      return incidente.reabrir(ANA, 'Volvió a hundirse', INICIO);
    case Accion.CERRAR:
      return incidente.cerrar(ANA.usuario, INICIO);
  }
}

describe('Tabla de transiciones del incidente', () => {
  it.each(transicionesValidas)('$origen --$accion--> $destino', ({ origen, accion, destino }) => {
    const incidente = unBache().en(origen);

    ejecutar(accion, incidente);

    expect(incidente.estado.nombre).toBe(destino);
    const ultimoCambio = incidente.historial.at(-1)!;
    expect(ultimoCambio.estadoAnterior).toBe(origen);
    expect(ultimoCambio.estadoNuevo).toBe(destino);
  });

  it.each(transicionesInvalidas)('$origen no permite $accion', ({ origen, accion }) => {
    const incidente = unBache().en(origen);
    const cambiosAntes = incidente.historial.length;

    expect(() => ejecutar(accion, incidente)).toThrow(TransicionInvalidaError);
    expect(() => ejecutar(accion, incidente)).toThrow(origen);
    expect(incidente.estado.nombre).toBe(origen);
    expect(incidente.historial).toHaveLength(cambiosAntes);
  });

  it.each(ESTADOS)('las acciones que ofrece la UI en %s coinciden con la tabla', (estado) => {
    const esperadas = new Set(Object.keys(TRANSICIONES[estado] ?? {}));

    expect(new Set(unBache().en(estado).accionesPermitidas())).toEqual(esperadas);
  });

  it.each(ESTADOS)('el nombre persistido %s reconstruye el mismo estado', (estado) => {
    expect(EstadoIncidente.desdeNombre(estado).nombre).toBe(estado);
  });
});
