import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import type { Usuario } from '../../src/models/Usuario.js';
import { configurarReloj, RelojDelSistema } from '../../src/utils/reloj.js';
import { RelojDeDemo } from '../../src/utils/relojDeDemo.js';
import {
  autorizacion,
  conectarBaseDePruebas,
  desconectarBaseDePruebas,
  type EscenarioGuardado,
  reiniciarBase,
} from '../db/baseDePruebas.js';
import { INICIO } from '../domain/escenario.js';

let escenario: EscenarioGuardado;

const consultar = (ruta: string) => request(app).get(ruta).set('Authorization', autorizacion(escenario.operadora));

const reportarBache = (reportante: Usuario = escenario.ana.usuario) =>
  request(app).post('/api/incidentes').set('Authorization', autorizacion(reportante)).send({
    tipoIncidenteId: escenario.bache.id,
    descripcion: 'Bache profundo en la mano que va al centro',
    latitud: -34.5986,
    longitud: -58.4202,
    direccion: 'Av. Medrano 950',
    barrio: 'Almagro',
  });

const cambiarEstado = (id: number, actor: Usuario, cambio: Record<string, unknown>) =>
  request(app).post(`/api/incidentes/${id}/cambios-de-estado`).set('Authorization', autorizacion(actor)).send(cambio);

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
    const tipos = await consultar('/api/tipos-incidente');
    const cuadrillas = await consultar('/api/cuadrillas');

    expect(tipos.body).toEqual([{ id: escenario.bache.id, nombre: 'Bache', slaHoras: 48 }]);
    expect(cuadrillas.body).toMatchObject([{ nombre: 'Norte', miembros: ['cuadrilla.norte.1'] }]);
  });

  it('POST /api/incidentes reporta a nombre del usuario del token, con la hora del reloj', async () => {
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
    const respuesta = await request(app)
      .post('/api/incidentes')
      .set('Authorization', autorizacion(escenario.ana.usuario))
      .send({ descripcion: 'Bache' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain('latitud');
  });

  it('POST /api/incidentes con un tipo inexistente responde 404', async () => {
    const respuesta = await request(app)
      .post('/api/incidentes')
      .set('Authorization', autorizacion(escenario.ana.usuario))
      .send({ tipoIncidenteId: 999, descripcion: 'Bache', latitud: -34.6, longitud: -58.4 });

    expect(respuesta.status).toBe(404);
  });

  it('recorre el camino completo: validar, asignar, iniciar, resolver y cerrar', async () => {
    const { operadora, miembroNorte, ana, norte } = escenario;
    const { id } = (await reportarBache()).body;

    const pasos: [Usuario, Record<string, unknown>][] = [
      [operadora, { accion: 'VALIDAR' }],
      [operadora, { accion: 'ASIGNAR', cuadrillaId: norte.id }],
      [miembroNorte, { accion: 'INICIAR_TRABAJO' }],
      [miembroNorte, { accion: 'RESOLVER', evidencia: { rutaFoto: 'fotos/bache.jpg', nota: 'Rellenado' } }],
      [ana.usuario, { accion: 'CERRAR' }],
    ];
    for (const [actor, cambio] of pasos) {
      expect((await cambiarEstado(id, actor, cambio)).status).toBe(201);
    }

    const detalle = await consultar(`/api/incidentes/${id}`);
    expect(detalle.body.estado).toBe('CERRADO');
    expect(detalle.body.historial.map((cambio: { estadoNuevo: string; actor: string }) => [cambio.estadoNuevo, cambio.actor])).toEqual([
      ['REPORTADO', 'vecina.ana'],
      ['VALIDADO', 'operadora.carla'],
      ['ASIGNADO', 'operadora.carla'],
      ['EN_CURSO', 'cuadrilla.norte.1'],
      ['RESUELTO', 'cuadrilla.norte.1'],
      ['CERRADO', 'vecina.ana'],
    ]);
    expect(detalle.body.evidencias).toMatchObject([{ rutaFoto: 'fotos/bache.jpg', autor: 'cuadrilla.norte.1' }]);
    expect(detalle.body.accionesPermitidas).toEqual([]);
  });

  it('una transición que el estado no admite responde 409', async () => {
    const { id } = (await reportarBache()).body;

    const respuesta = await cambiarEstado(id, escenario.miembroNorte, { accion: 'INICIAR_TRABAJO' });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.message).toBe('No se puede iniciar el trabajo de un incidente en estado REPORTADO');
  });

  it('una regla de negocio violada responde 422', async () => {
    const { id } = (await reportarBache()).body;

    const sinMotivo = await cambiarEstado(id, escenario.operadora, { accion: 'RECHAZAR' });
    const duplicadoDeSiMismo = await cambiarEstado(id, escenario.operadora, { accion: 'MARCAR_DUPLICADO', originalId: id });

    expect(sinMotivo.status).toBe(422);
    expect(duplicadoDeSiMismo.status).toBe(422);
  });

  it('un rol sin el permiso de la acción recibe 403', async () => {
    const { id } = (await reportarBache()).body;

    const vecinaValida = await cambiarEstado(id, escenario.ana.usuario, { accion: 'VALIDAR' });
    const operadoraReporta = await reportarBache(escenario.operadora);

    expect(vecinaValida.status).toBe(403);
    expect(vecinaValida.body.message).toBe('Tu rol no puede validar incidentes');
    expect(operadoraReporta.status).toBe(403);
  });

  it('sin token responde 401', async () => {
    expect((await request(app).get('/api/incidentes')).status).toBe(401);
    expect((await request(app).get('/api/incidentes').set('Authorization', 'Bearer cualquier-cosa')).status).toBe(401);
  });

  it('una acción desconocida responde 400 y un incidente inexistente 404', async () => {
    const { id } = (await reportarBache()).body;

    expect((await cambiarEstado(id, escenario.operadora, { accion: 'BORRAR' })).status).toBe(400);
    expect((await consultar('/api/incidentes/999')).status).toBe(404);
    expect((await consultar('/api/incidentes/abc')).status).toBe(400);
  });

  it('GET /api/incidentes filtra por estado', async () => {
    const { id } = (await reportarBache()).body;
    await reportarBache(escenario.bruno.usuario);
    await cambiarEstado(id, escenario.operadora, { accion: 'VALIDAR' });

    const validados = await consultar('/api/incidentes?estado=VALIDADO');
    const todos = await consultar('/api/incidentes');

    expect(validados.body.map((incidente: { id: number }) => incidente.id)).toEqual([id]);
    expect(todos.body).toHaveLength(2);
    expect((await consultar('/api/incidentes?estado=CUALQUIERA')).status).toBe(400);
  });
});
