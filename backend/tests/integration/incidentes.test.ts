import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { configurarReloj, RelojDelSistema } from '../../src/utils/reloj.js';
import { RelojDeDemo } from '../../src/utils/relojDeDemo.js';
import { conectarBaseDePruebas, desconectarBaseDePruebas, type EscenarioGuardado, reiniciarBase } from '../db/baseDePruebas.js';
import { INICIO } from '../domain/escenario.js';

let escenario: EscenarioGuardado;

const reportarBache = (reportante = 'vecina.ana') =>
  request(app).post('/api/incidentes').send({
    tipoIncidenteId: escenario.bache.id,
    descripcion: 'Bache profundo en la mano que va al centro',
    latitud: -34.5986,
    longitud: -58.4202,
    direccion: 'Av. Medrano 950',
    barrio: 'Almagro',
    reportante,
  });

const cambiarEstado = (id: number, cambio: Record<string, unknown>) =>
  request(app).post(`/api/incidentes/${id}/cambios-de-estado`).send(cambio);

describe('API de incidentes', () => {
  beforeAll(async () => {
    configurarReloj(new RelojDeDemo(INICIO));
    await conectarBaseDePruebas();
  });

  afterAll(async () => {
    configurarReloj(new RelojDelSistema());
    await desconectarBaseDePruebas();
  });

  beforeEach(async () => {
    escenario = await reiniciarBase();
  });

  it('GET /api/tipos-incidente y /api/cuadrillas devuelven los datos para los formularios', async () => {
    const tipos = await request(app).get('/api/tipos-incidente');
    const cuadrillas = await request(app).get('/api/cuadrillas');

    expect(tipos.body).toEqual([{ id: escenario.bache.id, nombre: 'Bache', slaHoras: 48 }]);
    expect(cuadrillas.body).toMatchObject([{ nombre: 'Norte', miembros: ['cuadrilla.norte.1'] }]);
  });

  it('POST /api/incidentes reporta un incidente con la hora del reloj', async () => {
    const respuesta = await reportarBache();

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({
      estado: 'REPORTADO',
      tipo: { nombre: 'Bache' },
      reportante: { username: 'vecina.ana' },
      fechaReporte: INICIO.toISOString(),
      accionesPermitidas: expect.arrayContaining(['VALIDAR', 'RECHAZAR']),
    });
    expect(respuesta.body.id).toBeTypeOf('number');
  });

  it('POST /api/incidentes sin datos obligatorios responde 400', async () => {
    const respuesta = await request(app).post('/api/incidentes').send({ descripcion: 'Bache', reportante: 'vecina.ana' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain('latitud');
  });

  it('POST /api/incidentes con un tipo inexistente responde 404', async () => {
    const respuesta = await request(app).post('/api/incidentes').send({
      tipoIncidenteId: 999,
      descripcion: 'Bache',
      latitud: -34.6,
      longitud: -58.4,
      reportante: 'vecina.ana',
    });

    expect(respuesta.status).toBe(404);
  });

  it('recorre el camino completo: validar, asignar, iniciar, resolver y cerrar', async () => {
    const { id } = (await reportarBache()).body;

    const pasos = [
      { accion: 'VALIDAR', actor: 'operadora.carla' },
      { accion: 'ASIGNAR', actor: 'operadora.carla', cuadrillaId: escenario.norte.id },
      { accion: 'INICIAR_TRABAJO', actor: 'cuadrilla.norte.1' },
      { accion: 'RESOLVER', actor: 'cuadrilla.norte.1', evidencia: { rutaFoto: 'fotos/bache.jpg', nota: 'Rellenado' } },
      { accion: 'CERRAR', actor: 'vecina.ana' },
    ];
    for (const paso of pasos) {
      expect((await cambiarEstado(id, paso)).status).toBe(201);
    }

    const detalle = await request(app).get(`/api/incidentes/${id}`);
    expect(detalle.body.estado).toBe('CERRADO');
    expect(detalle.body.historial.map((cambio: { estadoNuevo: string }) => cambio.estadoNuevo)).toEqual([
      'REPORTADO',
      'VALIDADO',
      'ASIGNADO',
      'EN_CURSO',
      'RESUELTO',
      'CERRADO',
    ]);
    expect(detalle.body.evidencias).toMatchObject([{ rutaFoto: 'fotos/bache.jpg', autor: 'cuadrilla.norte.1' }]);
    expect(detalle.body.accionesPermitidas).toEqual([]);
  });

  it('una transición que el estado no admite responde 409', async () => {
    const { id } = (await reportarBache()).body;

    const respuesta = await cambiarEstado(id, { accion: 'INICIAR_TRABAJO', actor: 'cuadrilla.norte.1' });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.message).toBe('No se puede iniciar el trabajo de un incidente en estado REPORTADO');
  });

  it('una regla de negocio violada responde 422', async () => {
    const { id } = (await reportarBache()).body;

    const sinMotivo = await cambiarEstado(id, { accion: 'RECHAZAR', actor: 'operadora.carla' });
    const duplicadoDeSiMismo = await cambiarEstado(id, { accion: 'MARCAR_DUPLICADO', actor: 'operadora.carla', originalId: id });

    expect(sinMotivo.status).toBe(422);
    expect(duplicadoDeSiMismo.status).toBe(422);
  });

  it('una acción desconocida responde 400 y un incidente inexistente 404', async () => {
    const { id } = (await reportarBache()).body;

    expect((await cambiarEstado(id, { accion: 'BORRAR', actor: 'operadora.carla' })).status).toBe(400);
    expect((await request(app).get('/api/incidentes/999')).status).toBe(404);
    expect((await request(app).get('/api/incidentes/abc')).status).toBe(400);
  });

  it('GET /api/incidentes filtra por estado', async () => {
    const { id } = (await reportarBache()).body;
    await reportarBache('vecino.bruno');
    await cambiarEstado(id, { accion: 'VALIDAR', actor: 'operadora.carla' });

    const validados = await request(app).get('/api/incidentes?estado=VALIDADO');
    const todos = await request(app).get('/api/incidentes');

    expect(validados.body.map((incidente: { id: number }) => incidente.id)).toEqual([id]);
    expect(todos.body).toHaveLength(2);
    expect((await request(app).get('/api/incidentes?estado=CUALQUIERA')).status).toBe(400);
  });
});
