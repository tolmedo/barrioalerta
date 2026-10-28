import { describe, expect, it } from 'vitest';
import { ReglaDeNegocioError } from '../../src/compartido/dominio/errores.js';
import { masDias, masHoras } from '../../src/compartido/dominio/tiempo.js';
import { Cuadrilla } from '../../src/incidentes/dominio/cuadrilla.js';
import { Asignado, Validado } from '../../src/incidentes/dominio/estados.js';
import {
  ANA,
  BRUNO,
  INICIO,
  LUMINARIAS,
  MEDRANO_950,
  MIEMBRO_LUMINARIAS,
  MIEMBRO_NORTE,
  NORTE,
  OBELISCO,
  OPERADORA,
  unBache,
} from './escenario.js';

describe('Incidente', () => {
  describe('Auditoría', () => {
    it('el alta queda registrada como primer cambio, firmado por el reportante', () => {
      const alta = unBache().reportado().historial[0]!;

      expect(alta.estadoAnterior).toBeNull();
      expect(alta.estadoNuevo).toBe('REPORTADO');
      expect(alta.actor).toBe(ANA.usuario);
      expect(alta.fecha).toEqual(INICIO);
    });

    it('cada transición registra quién, qué, cuándo y por qué', () => {
      const incidente = unBache().reportado();

      incidente.rechazar(OPERADORA, 'Está en propiedad privada', masHoras(INICIO, 2));

      expect(incidente.historial.at(-1)).toEqual({
        estadoAnterior: 'REPORTADO',
        estadoNuevo: 'RECHAZADO',
        actor: OPERADORA,
        fecha: masHoras(INICIO, 2),
        motivo: 'Está en propiedad privada',
      });
    });

    it('la reasignación queda auditada aunque no cambie el estado', () => {
      const sur = new Cuadrilla('Sur', MEDRANO_950, NORTE.especialidades, NORTE.miembros);
      const incidente = unBache().en('ASIGNADO');

      incidente.asignar(sur, OPERADORA, INICIO);

      const cambio = incidente.historial.at(-1)!;
      expect(cambio.estadoAnterior).toBe('ASIGNADO');
      expect(cambio.estadoNuevo).toBe('ASIGNADO');
      expect(cambio.motivo).toBe('Reasignado a Sur');
      expect(incidente.cuadrillaAsignada).toBe(sur);
    });

    it('rechazar exige motivo', () => {
      expect(() => unBache().reportado().rechazar(OPERADORA, ' ', INICIO)).toThrow(ReglaDeNegocioError);
    });
  });

  describe('Adhesiones', () => {
    it('otro vecino puede adherir a un incidente abierto', () => {
      const incidente = unBache().en('VALIDADO');

      incidente.adherir(BRUNO, INICIO);

      expect(incidente.cantidadAdhesiones).toBe(1);
      expect(incidente.extraerEventos().map((evento) => evento.tipo)).toEqual(['AdhesionRegistrada']);
    });

    it('el reportante no puede adherir', () => {
      expect(() => unBache().reportado().adherir(ANA, INICIO)).toThrow(ReglaDeNegocioError);
    });

    it('nadie adhiere dos veces', () => {
      const incidente = unBache().reportado();
      incidente.adherir(BRUNO, INICIO);

      expect(() => incidente.adherir(BRUNO, INICIO)).toThrow(ReglaDeNegocioError);
    });

    it('un incidente resuelto no admite adhesiones', () => {
      const incidente = unBache().en('RESUELTO');

      expect(() => incidente.adherir(BRUNO, INICIO)).toThrow(/RESUELTO/);
    });
  });

  describe('Reglas de cuadrillas', () => {
    it('no se asigna una cuadrilla sin la especialidad', () => {
      const incidente = unBache().en('VALIDADO');

      expect(() => incidente.asignar(LUMINARIAS, OPERADORA, INICIO)).toThrow(/Luminarias/);
    });

    it('solo un miembro de la cuadrilla asignada inicia el trabajo', () => {
      const incidente = unBache().en('ASIGNADO');

      expect(() => incidente.iniciarTrabajo(MIEMBRO_LUMINARIAS, INICIO)).toThrow(ReglaDeNegocioError);
      expect(incidente.estado).toBe(Asignado.INSTANCIA);
    });

    it('resolver exige evidencia', () => {
      const incidente = unBache().en('EN_CURSO');

      expect(() => incidente.resolver(MIEMBRO_NORTE, null, INICIO)).toThrow(ReglaDeNegocioError);
    });
  });

  describe('Cierre y reapertura', () => {
    it('otro vecino no puede cerrar', () => {
      expect(() => unBache().en('RESUELTO').cerrar(BRUNO.usuario, INICIO)).toThrow(ReglaDeNegocioError);
    });

    it('reabrir vuelve a Validado y libera la cuadrilla', () => {
      const incidente = unBache().en('RESUELTO');

      incidente.reabrir(ANA, 'Se volvió a hundir', masDias(INICIO, 2));

      expect(incidente.estado).toBe(Validado.INSTANCIA);
      expect(incidente.cuadrillaAsignada).toBeNull();
    });

    it('no se puede reabrir pasado el plazo', () => {
      const incidente = unBache().en('RESUELTO');

      expect(() => incidente.reabrir(ANA, 'Se volvió a hundir', masDias(INICIO, 8))).toThrow(ReglaDeNegocioError);
    });

    it('solo el reportante puede reabrir', () => {
      expect(() => unBache().en('RESUELTO').reabrir(BRUNO, 'No me gusta', INICIO)).toThrow(ReglaDeNegocioError);
    });
  });

  describe('SLA y escalamiento', () => {
    it('el vencimiento se calcula desde el reporte con el SLA del tipo', () => {
      expect(unBache().reportado().vencimientoSla).toEqual(masHoras(INICIO, 48));
    });

    it('un incidente validado vence al cumplirse el SLA', () => {
      const incidente = unBache().en('VALIDADO');

      expect(incidente.estaVencido(masHoras(INICIO, 47))).toBe(false);
      expect(incidente.estaVencido(masHoras(INICIO, 48))).toBe(true);
    });

    it('el SLA no corre en estados que no lo cuentan', () => {
      expect(unBache().reportado().estaVencido(masDias(INICIO, 10))).toBe(false);
      expect(unBache().en('RESUELTO').estaVencido(masDias(INICIO, 10))).toBe(false);
    });

    it('escala una vez por período de SLA', () => {
      const incidente = unBache().en('ASIGNADO');

      incidente.escalar(masHoras(INICIO, 48));

      expect(incidente.nivelEscalamiento).toBe(1);
      expect(incidente.debeEscalar(masHoras(INICIO, 95))).toBe(false);
      expect(incidente.debeEscalar(masHoras(INICIO, 96))).toBe(true);
      expect(incidente.extraerEventos().map((evento) => evento.tipo)).toEqual(['IncidenteEscalado']);
    });

    it('no se escala antes de tiempo', () => {
      expect(() => unBache().en('VALIDADO').escalar(masHoras(INICIO, 10))).toThrow(ReglaDeNegocioError);
    });
  });

  describe('Eventos de dominio', () => {
    it('reportar y validar generan sus eventos, y extraerlos los vacía', () => {
      const incidente = unBache().reportado();
      incidente.validar(OPERADORA, INICIO);

      const [reportado, cambiado, ...resto] = incidente.extraerEventos();

      expect(reportado?.tipo).toBe('IncidenteReportado');
      expect(cambiado).toMatchObject({ tipo: 'EstadoIncidenteCambiado', estadoNuevo: 'VALIDADO', actor: OPERADORA });
      expect(resto).toEqual([]);
      expect(incidente.extraerEventos()).toEqual([]);
    });
  });

  it('la distancia entre UTN Medrano y el Obelisco es de unos 3600 metros', () => {
    expect(MEDRANO_950.distanciaMetrosA(OBELISCO)).toBeCloseTo(3578, -2);
  });
});
