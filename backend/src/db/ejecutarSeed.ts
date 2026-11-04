import { AppDataSource, inicializarDB } from './connection.js';
import { cargarSeed } from './seed.js';
import { inicioDeDemo } from '../utils/relojDeDemo.js';

// Uso: npm run seed. Borra todas las tablas de la base configurada y carga los datos de la demo.
const inicio = inicioDeDemo();
await inicializarDB();
await cargarSeed(inicio);
await AppDataSource.destroy();
console.log(`Seed cargado en ${AppDataSource.options.database} (reloj de demo: ${inicio.toLocaleString('es-AR')})`);
