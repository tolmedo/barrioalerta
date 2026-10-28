import { crearApp } from './app.js';
import { RelojDelSistema, type Reloj } from './compartido/dominio/tiempo.js';
import { RelojDeDemo } from './demo/relojDeDemo.js';

const PUERTO = Number(process.env.PORT ?? 8080);
const MODO_DEMO = process.argv.includes('--demo') || process.env.BARRIOALERTA_DEMO === '1';

/** En la demo el reloj arranca congelado: a las 10:00 de hoy o en la fecha de RELOJ_INICIAL (ISO 8601). */
function inicioDeDemo(): Date {
  if (process.env.RELOJ_INICIAL) {
    return new Date(process.env.RELOJ_INICIAL);
  }
  const hoy = new Date();
  hoy.setHours(10, 0, 0, 0);
  return hoy;
}

const reloj: Reloj = MODO_DEMO ? new RelojDeDemo(inicioDeDemo()) : new RelojDelSistema();

crearApp({ reloj }).listen(PUERTO, () => {
  console.log(`BarrioAlerta escuchando en http://localhost:${PUERTO}${MODO_DEMO ? ' (modo demo)' : ''}`);
});
