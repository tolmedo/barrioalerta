import { obtenerReloj } from '../utils/reloj.js';

export const obtenerSalud = () => ({
  mensaje: 'Hola desde BarrioAlerta',
  horaDelSistema: obtenerReloj().ahora().toISOString(),
});
