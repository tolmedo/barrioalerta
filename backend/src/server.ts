import app from './app.js';
import { configurarReloj } from './utils/reloj.js';
import { RelojDeDemo } from './utils/relojDeDemo.js';

const PORT = Number(process.env.PORT ?? 8080);
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

if (MODO_DEMO) {
  configurarReloj(new RelojDeDemo(inicioDeDemo()));
}

app.listen(PORT, () => {
  console.log(`BarrioAlerta escuchando en http://localhost:${PORT}${MODO_DEMO ? ' (modo demo)' : ''}`);
});
