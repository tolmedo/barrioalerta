import bcrypt from 'bcryptjs';
import { AppDataSource, inicializarDB } from '../../src/db/connection.js';
import { Cuadrilla } from '../../src/models/Cuadrilla.js';
import type { TipoIncidente } from '../../src/models/TipoIncidente.js';
import { type Rol, Usuario } from '../../src/models/Usuario.js';
import { Vecino } from '../../src/models/Vecino.js';
import * as cuadrillaRepository from '../../src/repositories/cuadrillaRepository.js';
import * as rolRepository from '../../src/repositories/rolRepository.js';
import * as tipoIncidenteRepository from '../../src/repositories/tipoIncidenteRepository.js';
import * as usuarioRepository from '../../src/repositories/usuarioRepository.js';
import * as vecinoRepository from '../../src/repositories/vecinoRepository.js';
import { generarToken } from '../../src/utils/tokenUtils.js';
import { ANA, BACHE, BRUNO, MIEMBRO_NORTE, NORTE, OPERADORA } from '../domain/escenario.js';

/** Todos los usuarios del escenario tienen esta contraseña. */
export const CLAVE_DE_PRUEBA = 'clave-de-prueba';

// Costo bajo para que los tests no tarden; la app usa el costo por defecto.
const HASH_DE_PRUEBA = bcrypt.hashSync(CLAVE_DE_PRUEBA, 4);

/** Header Authorization con un token válido para el usuario. */
export const autorizacion = (usuario: Usuario) =>
  `Bearer ${generarToken({ username: usuario.username, rol: usuario.rol.nombre })}`;

/** Los datos del escenario ya guardados, con sus ids. */
export interface EscenarioGuardado {
  ana: Vecino;
  bruno: Vecino;
  operadora: Usuario;
  miembroNorte: Usuario;
  bache: TipoIncidente;
  norte: Cuadrilla;
}

export async function conectarBaseDePruebas() {
  if (process.env.DB_SCHEMA !== 'pruebas') {
    throw new Error('Los tests con base de datos solo corren sobre el esquema "pruebas"');
  }
  await inicializarDB();
}

export const desconectarBaseDePruebas = () => AppDataSource.destroy();

/** Borra y recrea las tablas, y guarda los datos del escenario. */
export async function reiniciarBase(): Promise<EscenarioGuardado> {
  await AppDataSource.synchronize(true);

  const roles = new Map<string, Rol>();
  const guardarRol = async (rol: Rol) => {
    if (!roles.has(rol.nombre)) {
      roles.set(rol.nombre, await rolRepository.create(rol));
    }
    return roles.get(rol.nombre)!;
  };
  const guardarUsuario = async (usuario: Usuario) =>
    usuarioRepository.create(new Usuario(usuario.username, await guardarRol(usuario.rol)), HASH_DE_PRUEBA);
  const guardarVecino = async (vecino: Vecino) =>
    vecinoRepository.create(new Vecino(vecino.nombre, await guardarUsuario(vecino.usuario), vecino.barrio, vecino.canalPreferido));

  const ana = await guardarVecino(ANA);
  const bruno = await guardarVecino(BRUNO);
  const operadora = await guardarUsuario(OPERADORA);
  const miembroNorte = await guardarUsuario(MIEMBRO_NORTE);
  const bache = await tipoIncidenteRepository.create(BACHE);
  const norte = await cuadrillaRepository.create(new Cuadrilla(NORTE.nombre, NORTE.base, [bache], [miembroNorte]));

  return { ana, bruno, operadora, miembroNorte, bache, norte };
}
