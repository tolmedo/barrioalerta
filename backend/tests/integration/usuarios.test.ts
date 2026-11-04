import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { leerToken } from '../../src/utils/tokenUtils.js';
import { CLAVE_DE_PRUEBA, conectarBaseDePruebas, desconectarBaseDePruebas, reiniciarBase } from '../db/baseDePruebas.js';

const login = (username: string, password: string) => request(app).post('/api/usuarios/login').send({ username, password });

describe('POST /api/usuarios/login', () => {
  beforeAll(conectarBaseDePruebas);
  afterAll(desconectarBaseDePruebas);
  beforeEach(async () => {
    await reiniciarBase();
  });

  it('con la contraseña correcta devuelve un token y los datos de la sesión', async () => {
    const respuesta = await login('vecina.ana', CLAVE_DE_PRUEBA);

    expect(respuesta.status).toBe(200);
    expect(leerToken(respuesta.body.token)).toEqual({ username: 'vecina.ana', rol: 'VECINO' });
    expect(respuesta.body.usuario).toMatchObject({
      username: 'vecina.ana',
      rol: 'VECINO',
      vecino: { nombre: 'Ana', barrio: 'Almagro' },
    });
    expect([...respuesta.body.usuario.permisos].sort()).toEqual(['ADHERIR_INCIDENTE', 'REPORTAR_INCIDENTE']);
  });

  it('un usuario que no es vecino no tiene perfil de vecino', async () => {
    const respuesta = await login('operadora.carla', CLAVE_DE_PRUEBA);

    expect(respuesta.body.usuario).toMatchObject({ rol: 'OPERADOR', vecino: null });
  });

  it('con datos incorrectos responde 401 con el mismo mensaje, exista o no el usuario', async () => {
    const claveIncorrecta = await login('vecina.ana', 'otra');
    const usuarioInexistente = await login('nadie', CLAVE_DE_PRUEBA);

    expect(claveIncorrecta.status).toBe(401);
    expect(usuarioInexistente.status).toBe(401);
    expect(claveIncorrecta.body.message).toBe(usuarioInexistente.body.message);
  });

  it('sin usuario o contraseña responde 400', async () => {
    expect((await request(app).post('/api/usuarios/login').send({ username: 'vecina.ana' })).status).toBe(400);
  });
});
