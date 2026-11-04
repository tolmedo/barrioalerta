import { DataSource } from 'typeorm';
import { CuadrillaSchema } from './schemas/CuadrillaSchema.js';
import { AdhesionSchema, CambioDeEstadoSchema, EvidenciaSchema, IncidenteSchema } from './schemas/IncidenteSchema.js';
import { RolPermisoSchema, RolSchema } from './schemas/RolSchema.js';
import { TipoIncidenteSchema } from './schemas/TipoIncidenteSchema.js';
import { UsuarioSchema } from './schemas/UsuarioSchema.js';
import { VecinoSchema } from './schemas/VecinoSchema.js';

const ESQUEMA = process.env.DB_SCHEMA ?? 'public';

/**
 * PostgreSQL con TypeORM. Las tablas se generan a partir de los schemas (`synchronize`), sin
 * migraciones: la app corre local y la demo se resetea desde cero.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'barrioalerta',
  password: process.env.DB_PASSWORD ?? 'barrioalerta',
  database: process.env.DB_NAME ?? 'barrioalerta',
  schema: ESQUEMA,
  entities: [
    RolSchema,
    RolPermisoSchema,
    UsuarioSchema,
    VecinoSchema,
    TipoIncidenteSchema,
    CuadrillaSchema,
    IncidenteSchema,
    CambioDeEstadoSchema,
    AdhesionSchema,
    EvidenciaSchema,
  ],
});

/** Conecta y crea (o actualiza) las tablas. El esquema se crea antes porque TypeORM no lo hace solo. */
export const inicializarDB = async () => {
  await AppDataSource.initialize();
  await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${ESQUEMA}"`);
  await AppDataSource.synchronize();
};

export const conectarDB = async () => {
  try {
    await inicializarDB();
    console.log(`PostgreSQL conectado: ${AppDataSource.options.database}`);
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', (error as Error).message);
    process.exit(1);
  }
};
