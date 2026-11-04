import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppDataSource, inicializarDB } from '../../src/db/connection.js';
import { IncidenteSchema } from '../../src/db/schemas/IncidenteSchema.js';
import { Cuadrilla } from '../../src/models/Cuadrilla.js';
import { TransicionInvalidaError } from '../../src/models/EstadoIncidente.js';
import { Incidente } from '../../src/models/Incidente.js';
import { Evidencia } from '../../src/models/RegistrosIncidente.js';
import type { TipoIncidente } from '../../src/models/TipoIncidente.js';
import { type Rol, Usuario } from '../../src/models/Usuario.js';
import { Vecino } from '../../src/models/Vecino.js';
import * as cuadrillaRepository from '../../src/repositories/cuadrillaRepository.js';
import * as incidenteRepository from '../../src/repositories/incidenteRepository.js';
import * as rolRepository from '../../src/repositories/rolRepository.js';
import * as tipoIncidenteRepository from '../../src/repositories/tipoIncidenteRepository.js';
import * as usuarioRepository from '../../src/repositories/usuarioRepository.js';
import * as vecinoRepository from '../../src/repositories/vecinoRepository.js';
import { masHoras } from '../../src/utils/reloj.js';
import { ANA, BACHE, BRUNO, INICIO, MEDRANO_950, MIEMBRO_NORTE, NORTE, OPERADORA } from '../domain/escenario.js';

let ana: Vecino;
let bruno: Vecino;
let operadora: Usuario;
let miembroNorte: Usuario;
let bache: TipoIncidente;
let norte: Cuadrilla;

/** Guarda los datos del escenario y se queda con las versiones que tienen id. */
async function guardarEscenario() {
  const roles = new Map<string, Rol>();
  const guardarRol = async (rol: Rol) => {
    if (!roles.has(rol.nombre)) {
      roles.set(rol.nombre, await rolRepository.create(rol));
    }
    return roles.get(rol.nombre)!;
  };
  const guardarUsuario = async (usuario: Usuario) =>
    usuarioRepository.create(new Usuario(usuario.username, await guardarRol(usuario.rol)));
  const guardarVecino = async (vecino: Vecino) =>
    vecinoRepository.create(new Vecino(vecino.nombre, await guardarUsuario(vecino.usuario), vecino.barrio, vecino.canalPreferido));

  ana = await guardarVecino(ANA);
  bruno = await guardarVecino(BRUNO);
  operadora = await guardarUsuario(OPERADORA);
  miembroNorte = await guardarUsuario(MIEMBRO_NORTE);
  bache = await tipoIncidenteRepository.create(BACHE);
  norte = await cuadrillaRepository.create(new Cuadrilla(NORTE.nombre, NORTE.base, [bache], [miembroNorte]));
}

const unBacheReportadoPor = (vecino: Vecino) =>
  Incidente.reportar(bache, 'Bache profundo en la mano que va al centro', MEDRANO_950, vecino, INICIO);

const leer = async (incidente: Incidente) => (await incidenteRepository.getById(incidente.id!))!;

describe('incidenteRepository (PostgreSQL)', () => {
  beforeAll(async () => {
    if (process.env.DB_SCHEMA !== 'pruebas') {
      throw new Error('Los tests de repositorios solo corren sobre el esquema "pruebas"');
    }
    await inicializarDB();
  });

  afterAll(() => AppDataSource.destroy());

  beforeEach(async () => {
    await AppDataSource.synchronize(true);
    await guardarEscenario();
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
