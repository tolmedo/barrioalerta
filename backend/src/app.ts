import express, { type Express } from 'express';
import { manejadorDeErrores, rutaNoEncontrada } from './compartido/api/manejadorDeErrores.js';
import { rutasDeSalud } from './compartido/api/salud.js';
import type { Reloj } from './compartido/dominio/tiempo.js';

export interface Dependencias {
  reloj: Reloj;
}

/**
 * Raíz de composición: el único lugar donde se crean y conectan los objetos (inyección de
 * dependencias manual, C07). Cada módulo recibe lo que necesita por parámetro; nadie hace `new` de
 * sus dependencias. Los tests llaman a esta función con dependencias falsas.
 */
export function crearApp({ reloj }: Dependencias): Express {
  const app = express();
  app.use(express.json());

  app.use('/api/salud', rutasDeSalud(reloj));

  app.use('/api', rutaNoEncontrada);
  app.use(manejadorDeErrores);
  return app;
}
