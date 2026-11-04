import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppDataSource } from '../../src/db/connection.js';
import { IncidenteSchema } from '../../src/db/schemas/IncidenteSchema.js';
import type { Cuadrilla } from '../../src/models/Cuadrilla.js';
import { TransicionInvalidaError } from '../../src/models/EstadoIncidente.js';
import { Incidente } from '../../src/models/Incidente.js';
import { Evidencia } from '../../src/models/RegistrosIncidente.js';
import type { TipoIncidente } from '../../src/models/TipoIncidente.js';
import type { Usuario } from '../../src/models/Usuario.js';
import type { Vecino } from '../../src/models/Vecino.js';
import * as incidenteRepository from '../../src/repositories/incidenteRepository.js';
import { masHoras } from '../../src/utils/reloj.js';
import { conectarBaseDePruebas, desconectarBaseDePruebas, reiniciarBase } from '../db/baseDePruebas.js';
import { INICIO, MEDRANO_950 } from '../domain/escenario.js';

let ana: Vecino;
let bruno: Vecino;
let operadora: Usuario;
let miembroNorte: Usuario;
let bache: TipoIncidente;
let norte: Cuadrilla;

const unBacheReportadoPor = (vecino: Vecino) =>
  Incidente.reportar(bache, 'Bache profundo en la mano que va al centro', MEDRANO_950, vecino, INICIO);

const leer = async (incidente: Incidente) => (await incidenteRepository.getById(incidente.id!))!;

describe('incidenteRepository (PostgreSQL)', () => {
  beforeAll(conectarBaseDePruebas);
  afterAll(desconectarBaseDePruebas);

  beforeEach(async () => {
    ({ ana, bruno, operadora, miembroNorte, bache, norte } = await reiniciarBase());
  });

  it('guarda un incidente nuevo, le asigna id y lo recupera igual', async () => {
    const incidente = unBacheReportadoPor(ana);

    await incidenteRepository.save(incidente);
    const leido = await leer(incidente);

    expect(incidente.id).toBeTypeOf('number');
    expect(leido.estado.nombre).toBe('REPORTADO');
    expect(leido.tipo.esIgualA(bache)).toBe(true);
    expect(leido.descripcion).toBe(incidente.descripcion);
    expect(leido.ubicacion).toEqual(MEDRANO_950);
    expect(leido.esReportante(ana.usuario)).toBe(true);
    expect(leido.fechaReporte).toEqual(INICIO);
    expect(leido.vencimientoSla).toEqual(incidente.vencimientoSla);
    expect(leido.historial).toHaveLength(1);
    expect(leido.extraerEventos()).toEqual([]);
  });

  it('guarda cada transición en el historial, en orden y con su actor', async () => {
    const incidente = unBacheReportadoPor(ana);
    await incidenteRepository.save(incidente);

    incidente.validar(operadora, masHoras(INICIO, 1));
    incidente.asignar(norte, operadora, masHoras(INICIO, 2));
    await incidenteRepository.save(incidente);
    expect((await leer(incidente)).cuadrillaAsignada?.esIgualA(norte)).toBe(true);

    incidente.iniciarTrabajo(miembroNorte, masHoras(INICIO, 3));
    incidente.resolver(miembroNorte, new Evidencia('fotos/bache.jpg', 'Rellenado', miembroNorte, masHoras(INICIO, 4)), masHoras(INICIO, 4));
    await incidenteRepository.save(incidente);
    const leido = await leer(incidente);

    expect(leido.estado.nombre).toBe('RESUELTO');
    expect(leido.historial.map((cambio) => [cambio.estadoNuevo, cambio.actor.username])).toEqual([
      ['REPORTADO', 'vecina.ana'],
      ['VALIDADO', 'operadora.carla'],
      ['ASIGNADO', 'operadora.carla'],
      ['EN_CURSO', 'cuadrilla.norte.1'],
      ['RESUELTO', 'cuadrilla.norte.1'],
    ]);
    expect(leido.evidencias.map((evidencia) => evidencia.rutaFoto)).toEqual(['fotos/bache.jpg']);
  });

  it('un incidente leído de la base sigue aplicando sus reglas', async () => {
    const incidente = unBacheReportadoPor(ana);
    incidente.validar(operadora, INICIO);
    await incidenteRepository.save(incidente);

    const leido = await leer(incidente);
    expect(() => leido.validar(operadora, INICIO)).toThrow(TransicionInvalidaError);

    leido.asignar(norte, operadora, masHoras(INICIO, 1));
    await incidenteRepository.save(leido);
    expect((await leer(incidente)).estado.nombre).toBe('ASIGNADO');
  });

  it('guarda cada adhesión una sola vez y mantiene el contador desnormalizado', async () => {
    const incidente = unBacheReportadoPor(ana);
    await incidenteRepository.save(incidente);

    incidente.adherir(bruno, masHoras(INICIO, 1));
    await incidenteRepository.save(incidente);
    await incidenteRepository.save(incidente);

    expect((await leer(incidente)).cantidadAdhesiones).toBe(1);
    const fila = await AppDataSource.getRepository(IncidenteSchema).findOneBy({ id: incidente.id! });
    expect(fila?.cantidadAdhesiones).toBe(1);
  });

  it('guarda la referencia al incidente original de un duplicado', async () => {
    const original = unBacheReportadoPor(ana);
    await incidenteRepository.save(original);
    const duplicado = unBacheReportadoPor(bruno);
    duplicado.marcarDuplicadoDe(original, operadora, masHoras(INICIO, 1));

    await incidenteRepository.save(duplicado);
    const leido = await leer(duplicado);

    expect(leido.estado.nombre).toBe('DUPLICADO');
    expect(leido.original?.id).toBe(original.id);
    expect((await incidenteRepository.getAll()).map((incidente) => incidente.id)).toEqual([original.id, duplicado.id]);
  });
});
