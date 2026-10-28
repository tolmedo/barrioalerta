import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { crearApp } from '../../src/app.js';
import { RelojDeDemo } from '../../src/demo/relojDeDemo.js';

describe('API', () => {
  const app = crearApp({ reloj: new RelojDeDemo(new Date('2026-12-07T13:00:00Z')) });

  it('GET /api/salud saluda e informa la hora del reloj inyectado', async () => {
    const respuesta = await request(app).get('/api/salud');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ mensaje: 'Hola desde BarrioAlerta', horaDelSistema: '2026-12-07T13:00:00.000Z' });
  });

  it('una ruta inexistente responde 404 con el formato de error uniforme', async () => {
    const respuesta = await request(app).get('/api/no-existe');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toMatchObject({ codigo: 'NO_ENCONTRADO', detalles: [] });
  });
});
