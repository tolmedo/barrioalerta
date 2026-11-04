import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cargarSeed } from '../../src/db/seed.js';
import type { Incidente } from '../../src/models/Incidente.js';
import * as incidenteRepository from '../../src/repositories/incidenteRepository.js';
import { masHoras } from '../../src/utils/reloj.js';
import { conectarBaseDePruebas, desconectarBaseDePruebas } from './baseDePruebas.js';

const INICIO = new Date('2026-12-07T10:00:00-03:00');

/** Lo que el guion de la demo da por cargado. Si el seed cambia, este test avisa. */
describe('Seed de la demo', () => {
  let incidentes: Map<number, Incidente>;

  beforeAll(async () => {
    await conectarBaseDePruebas();
    await cargarSeed(INICIO);
    incidentes = new Map((await incidenteRepository.getAll()).map((incidente) => [incidente.id!, incidente]));
  }, 30_000);

  afterAll(desconectarBaseDePruebas);

  const incidente = (numero: number) => incidentes.get(numero)!;

  it('carga los incidentes del guion con su número, tipo y estado', () => {
    expect([101, 102, 103, 104, 110, 111].map((numero) => [numero, incidente(numero).tipo.nombre, incidente(numero).estado.nombre])).toEqual([
      [101, 'Bache', 'VALIDADO'],
      [102, 'Luminaria', 'VALIDADO'],
      [103, 'Luminaria', 'ASIGNADO'],
      [104, 'Luminaria', 'RESUELTO'],
      [110, 'Bache', 'VALIDADO'],
      [111, 'Bache', 'VALIDADO'],
    ]);
  });

  it('#101 está en Av. Medrano 950 con 2 adhesiones y Ana todavía puede sumarse', () => {
    expect(incidente(101).ubicacion.direccion).toBe('Av. Medrano 950');
    expect(incidente(101).cantidadAdhesiones).toBe(2);
    expect(incidente(101).adhesiones.some((adhesion) => adhesion.vecino.usuario.username === 'vecina.ana')).toBe(false);
  });

  it('#103 está asignado a Luminarias y #104 resuelto con foto', () => {
    expect(incidente(103).cuadrillaAsignada?.nombre).toBe('Luminarias');
    expect(incidente(104).evidencias.map((evidencia) => evidencia.rutaFoto)).toEqual(['fotos/luminaria-ok.jpg']);
  });

  it('#110 vence a las 48 h exactas del inicio y #111 ya está vencido', () => {
    expect(incidente(110).estaVencido(INICIO)).toBe(false);
    expect(incidente(110).debeEscalar(masHoras(INICIO, 48))).toBe(true);
    expect(incidente(111).estaVencido(INICIO)).toBe(true);
  });

  it('las cuadrillas tienen cargas 4 / 1 / 2', () => {
    const carga = (cuadrilla: string) =>
      [...incidentes.values()].filter(
        (i) => ['ASIGNADO', 'EN_CURSO'].includes(i.estado.nombre) && i.cuadrillaAsignada?.nombre === cuadrilla,
      ).length;

    expect([carga('Norte'), carga('Luminarias'), carga('Sur')]).toEqual([4, 1, 2]);
  });
});
