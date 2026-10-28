import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { configurarReloj, RelojDelSistema } from '../../src/utils/reloj.js';
import { RelojDeDemo } from '../../src/utils/relojDeDemo.js';

describe('API', () => {
  beforeAll(() => configurarReloj(new RelojDeDemo(new Date('2026-12-07T13:00:00Z'))));
  afterAll(() => configurarReloj(new RelojDelSistema()));

  it('GET /api/salud saluda e informa la hora del reloj configurado', async () => {
    const respuesta = await request(app).get('/api/salud');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ mensaje: 'Hola desde BarrioAlerta', horaDelSistema: '2026-12-07T13:00:00.000Z' });
  });

  it('una ruta inexistente responde 404 con el formato de error uniforme', async () => {
    const respuesta = await request(app).get('/api/no-existe');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toMatchObject({
      status: 'fail',
      message: 'Ruta /api/no-existe no encontrada',
      path: '/api/no-existe',
    });
  });
});
