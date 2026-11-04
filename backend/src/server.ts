import app from './app.js';
import { conectarDB } from './db/connection.js';
import { configurarReloj } from './utils/reloj.js';
import { inicioDeDemo, RelojDeDemo } from './utils/relojDeDemo.js';

const PORT = Number(process.env.PORT ?? 8080);
const MODO_DEMO = process.argv.includes('--demo') || process.env.BARRIOALERTA_DEMO === '1';

if (MODO_DEMO) {
  configurarReloj(new RelojDeDemo(inicioDeDemo()));
}

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`BarrioAlerta escuchando en http://localhost:${PORT}${MODO_DEMO ? ' (modo demo)' : ''}`);
  });
});
