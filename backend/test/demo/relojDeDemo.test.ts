import { describe, expect, it } from 'vitest';
import { RelojDeDemo } from '../../src/demo/relojDeDemo.js';

describe('RelojDeDemo', () => {
  const INICIO = new Date('2026-12-07T10:00:00-03:00');

  it('queda congelado hasta que se lo avanza', () => {
    const reloj = new RelojDeDemo(INICIO);
    expect(reloj.ahora()).toEqual(INICIO);

    reloj.avanzarHoras(48);

    expect(reloj.ahora()).toEqual(new Date('2026-12-09T10:00:00-03:00'));
  });

  it('no retrocede', () => {
    expect(() => new RelojDeDemo(INICIO).avanzarHoras(-1)).toThrow('no retrocede');
  });
});
