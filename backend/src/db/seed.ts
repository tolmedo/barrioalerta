import bcrypt from 'bcryptjs';
import { Cuadrilla } from '../models/Cuadrilla.js';
import { Incidente } from '../models/Incidente.js';
import { Permiso, TipoCanal } from '../models/Permiso.js';
import { Evidencia } from '../models/RegistrosIncidente.js';
import { TipoIncidente } from '../models/TipoIncidente.js';
import { Ubicacion } from '../models/Ubicacion.js';
import { Rol, Usuario } from '../models/Usuario.js';
import { Vecino } from '../models/Vecino.js';
import * as cuadrillaRepo from '../repositories/cuadrillaRepository.js';
import * as incidenteRepo from '../repositories/incidenteRepository.js';
import * as rolRepo from '../repositories/rolRepository.js';
import * as tipoIncidenteRepo from '../repositories/tipoIncidenteRepository.js';
import * as usuarioRepo from '../repositories/usuarioRepository.js';
import * as vecinoRepo from '../repositories/vecinoRepository.js';
import { masHoras } from '../utils/reloj.js';
import { AppDataSource, ESQUEMA } from './connection.js';

/** Contraseña común de los usuarios demo (no se muestra en las slides). */
export const CLAVE_DEMO = process.env.CLAVE_DEMO ?? 'demo2026';

const lugar = (latitud: number, longitud: number, direccion: string, barrio: string) =>
  new Ubicacion(latitud, longitud, direccion, barrio);

/** El próximo incidente que se guarde va a tener este número (los del guion: #101, #110, ...). */
const continuarNumeracionEn = (numero: number) =>
  AppDataSource.query(`SELECT setval(pg_get_serial_sequence('"${ESQUEMA}".incidente', 'id'), $1)`, [numero - 1]);

/**
 * Borra la base y carga los datos de la demo. Los incidentes se arman con el propio dominio
 * (reportar, validar, asignar...), así su historial es real. Todas las fechas son relativas a
 * `inicio`, la hora a la que arranca el reloj de demo.
 */
export async function cargarSeed(inicio: Date) {
  await AppDataSource.synchronize(true);
  const hora = (horas: number) => masHoras(inicio, horas);
  const passwordHash = await bcrypt.hash(CLAVE_DEMO, 10);

  // ─── roles y usuarios ────────────────────────────────────────────────────────
  const rolVecino = await rolRepo.create(new Rol('VECINO', [Permiso.REPORTAR_INCIDENTE, Permiso.ADHERIR_INCIDENTE]));
  const rolOperador = await rolRepo.create(new Rol('OPERADOR', [Permiso.GESTIONAR_INCIDENTES, Permiso.ASIGNAR_CUADRILLAS]));
  const rolCuadrilla = await rolRepo.create(new Rol('CUADRILLA', [Permiso.EJECUTAR_TRABAJOS]));
  const rolAdmin = await rolRepo.create(
    new Rol('ADMIN', [Permiso.ADMINISTRAR_CONFIGURACION, Permiso.IMPORTAR_DATOS, Permiso.OPERAR_DEMO]),
  );

  const usuario = (username: string, rol: Rol) => usuarioRepo.create(new Usuario(username, rol), passwordHash);
  const vecino = async (username: string, nombre: string, barrio: string, canal: TipoCanal) =>
    vecinoRepo.create(new Vecino(nombre, await usuario(username, rolVecino), barrio, canal));

  // Los 7 usuarios demo
  const ana = await vecino('vecina.ana', 'Ana', 'Almagro', TipoCanal.WHATSAPP);
  const bruno = await vecino('vecino.bruno', 'Bruno', 'Almagro', TipoCanal.EMAIL);
  const carla = await usuario('operadora.carla', rolOperador);
  const miembroNorte = await usuario('cuadrilla.norte.1', rolCuadrilla);
  const miembroLuminarias = await usuario('cuadrilla.luminarias.1', rolCuadrilla);
  const miembroSur = await usuario('cuadrilla.sur.1', rolCuadrilla);
  await usuario('admin', rolAdmin);

  // Otros vecinos del barrio, para las adhesiones y los reportes de fondo
  const diego = await vecino('vecino.diego', 'Diego', 'Almagro', TipoCanal.SMS);
  const elena = await vecino('vecina.elena', 'Elena', 'Boedo', TipoCanal.IN_APP);
  const fede = await vecino('vecino.fede', 'Federico', 'Balvanera', TipoCanal.EMAIL);

  // ─── tipos y cuadrillas ──────────────────────────────────────────────────────
  const bache = await tipoIncidenteRepo.create(new TipoIncidente('Bache', 48));
  const luminaria = await tipoIncidenteRepo.create(new TipoIncidente('Luminaria', 72));
  const basural = await tipoIncidenteRepo.create(new TipoIncidente('Basural', 24));
  const arbolCaido = await tipoIncidenteRepo.create(new TipoIncidente('Árbol caído', 12));
  const veredaRota = await tipoIncidenteRepo.create(new TipoIncidente('Vereda rota', 120));

  // Norte queda cerca de todo pero cargada; Luminarias, lejos pero libre: así las dos estrategias
  // de asignación proponen cuadrillas distintas para una luminaria en Almagro.
  const norte = await cuadrillaRepo.create(
    new Cuadrilla('Norte', lugar(-34.5975, -58.4195, 'Av. Medrano 1100', 'Almagro'), [bache, luminaria, veredaRota], [miembroNorte]),
  );
  const luminarias = await cuadrillaRepo.create(
    new Cuadrilla('Luminarias', lugar(-34.6037, -58.3816, 'Av. Corrientes y 9 de Julio', 'San Nicolás'), [luminaria], [miembroLuminarias]),
  );
  const sur = await cuadrillaRepo.create(
    new Cuadrilla('Sur', lugar(-34.629, -58.417, 'Av. Boedo 1500', 'Boedo'), [bache, basural, arbolCaido, veredaRota], [miembroSur]),
  );

  // ─── incidentes ──────────────────────────────────────────────────────────────
  const reportar = (tipo: TipoIncidente, ubicacion: Ubicacion, descripcion: string, reportante: Vecino, horas: number) =>
    Incidente.reportar(tipo, descripcion, ubicacion, reportante, hora(horas));

  const validado = (incidente: Incidente, horas: number) => {
    incidente.validar(carla, hora(horas));
    return incidente;
  };

  const asignado = (incidente: Incidente, cuadrilla: Cuadrilla, horas: number) => {
    validado(incidente, horas - 1).asignar(cuadrilla, carla, hora(horas));
    return incidente;
  };

  const enCurso = (incidente: Incidente, cuadrilla: Cuadrilla, horas: number) => {
    asignado(incidente, cuadrilla, horas - 2).iniciarTrabajo(cuadrilla.miembros[0]!, hora(horas));
    return incidente;
  };

  const resuelto = (incidente: Incidente, cuadrilla: Cuadrilla, foto: string, horas: number) => {
    const miembro = cuadrilla.miembros[0]!;
    enCurso(incidente, cuadrilla, horas - 4).resolver(miembro, new Evidencia(foto, 'Reparado', miembro, hora(horas)), hora(horas));
    return incidente;
  };

  const guardar = (incidente: Incidente) => incidenteRepo.save(incidente);

  // Incidentes del guion
  await continuarNumeracionEn(101);
  const i101 = validado(
    reportar(bache, lugar(-34.5986, -58.4202, 'Av. Medrano 950', 'Almagro'), 'Bache profundo en la mano que va al centro', diego, -26),
    -25,
  );
  i101.adherir(elena, hora(-20));
  i101.adherir(fede, hora(-10));
  await guardar(i101);
  const i102 = await guardar(
    validado(reportar(luminaria, lugar(-34.6107, -58.4207, 'Av. Rivadavia 3900', 'Almagro'), 'Luminaria apagada en la esquina', bruno, -30), -29),
  );
  await guardar(
    asignado(reportar(luminaria, lugar(-34.604, -58.4128, 'Av. Corrientes 3600', 'Almagro'), 'Poste sin luz frente a la plaza', elena, -50), luminarias, -48),
  );
  await guardar(
    resuelto(
      reportar(luminaria, lugar(-34.6045, -58.4105, 'Sarmiento 3300', 'Balvanera'), 'Luminaria intermitente toda la noche', fede, -72),
      luminarias,
      'fotos/luminaria-ok.jpg',
      -56,
    ),
  );

  await continuarNumeracionEn(110);
  await guardar(validado(reportar(bache, lugar(-34.606, -58.422, 'Av. Díaz Vélez 4000', 'Almagro'), 'Bache que crece con cada lluvia', bruno, 0), 0));
  await guardar(validado(reportar(bache, lugar(-34.603, -58.416, 'Billinghurst 600', 'Almagro'), 'Bache sobre la senda peatonal', diego, -72), -71));

  // Carga de las cuadrillas: Norte 4, Luminarias 1 (#103), Sur 2
  await continuarNumeracionEn(200);
  await guardar(asignado(reportar(bache, lugar(-34.6145, -58.4085, 'Av. Belgrano 3200', 'Balvanera'), 'Bache en la parada del colectivo', elena, -40), norte, -38));
  await guardar(enCurso(reportar(veredaRota, lugar(-34.599, -58.423, 'Av. Medrano 600', 'Almagro'), 'Baldosas levantadas por una raíz', ana, -100), norte, -90));
  await guardar(asignado(reportar(bache, lugar(-34.605, -58.404, 'Av. Pueyrredón 500', 'Balvanera'), 'Bache frente a la escuela', fede, -20), norte, -18));
  await guardar(enCurso(reportar(luminaria, lugar(-34.6062, -58.419, 'Av. Díaz Vélez 3800', 'Almagro'), 'Dos luminarias apagadas en la cuadra', diego, -15), norte, -12));
  await guardar(asignado(reportar(basural, lugar(-34.623, -58.4165, 'Av. Boedo 800', 'Boedo'), 'Basural en la vereda del baldío', elena, -10), sur, -8));
  await guardar(enCurso(reportar(arbolCaido, lugar(-34.6205, -58.412, 'Av. Independencia 3500', 'Boedo'), 'Rama caída sobre la calle', fede, -5), sur, -3));

  // Otros estados, para que la bandeja y "Mis reportes" no estén vacíos
  await guardar(reportar(bache, lugar(-34.618, -58.4275, 'Av. La Plata 300', 'Almagro'), 'Bache en la bajada del garaje', ana, -3));
  const rechazado = reportar(basural, lugar(-34.6035, -58.408, 'Sarmiento 3000', 'Balvanera'), 'Basura acumulada en la esquina', bruno, -12);
  rechazado.rechazar(carla, 'Es un contenedor municipal, no un basural', hora(-11));
  await guardar(rechazado);
  const cerrado = resuelto(reportar(veredaRota, lugar(-34.6255, -58.418, 'Av. Boedo 1200', 'Boedo'), 'Vereda hundida', ana, -200), sur, 'fotos/vereda-ok.jpg', -160);
  cerrado.cerrar(ana.usuario, hora(-150));
  await guardar(cerrado);
  const duplicado = reportar(luminaria, lugar(-34.6108, -58.4206, 'Av. Rivadavia 3900', 'Almagro'), 'No hay luz en la esquina', fede, -28);
  duplicado.marcarDuplicadoDe(i102, carla, hora(-27));
  await guardar(duplicado);
}
