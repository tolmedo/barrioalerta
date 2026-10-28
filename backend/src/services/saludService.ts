import { obtenerReloj } from '../utils/reloj.js';

/** Equivalente al "Hola" de la entrega 1: confirma que la API responde y con qué hora trabaja. */
export const obtenerSalud = () => ({
  mensaje: 'Hola desde BarrioAlerta',
  horaDelSistema: obtenerReloj().ahora().toISOString(),
});
