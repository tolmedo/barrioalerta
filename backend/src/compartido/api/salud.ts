import { Router } from 'express';
import type { Reloj } from '../dominio/tiempo.js';

/** Endpoint mínimo para verificar que la API responde (equivalente al "Hola" de la entrega 1). */
export function rutasDeSalud(reloj: Reloj): Router {
  return Router().get('/', (_pedido, respuesta) => {
    respuesta.json({ mensaje: 'Hola desde BarrioAlerta', horaDelSistema: reloj.ahora().toISOString() });
  });
}
