import { TipoCanal, Permiso } from '../../src/models/Permiso.js';
import { Rol, Usuario } from '../../src/models/Usuario.js';
import { Cuadrilla } from '../../src/models/Cuadrilla.js';
import type { NombreEstado } from '../../src/models/EstadoIncidente.js';
import { Incidente } from '../../src/models/Incidente.js';
import { Evidencia } from '../../src/models/RegistrosIncidente.js';
import { TipoIncidente } from '../../src/models/TipoIncidente.js';
import { Ubicacion } from '../../src/models/Ubicacion.js';
import { Vecino } from '../../src/models/Vecino.js';

/**
 * Datos de prueba compartidos (los mismos nombres que el seed de la demo) y un builder que lleva un
 * incidente a cualquier estado usando solo transiciones reales, nunca setters.
 */
export const INICIO = new Date('2026-12-07T10:00:00-03:00');

const ROL_VECINO = new Rol('VECINO', [Permiso.REPORTAR_INCIDENTE, Permiso.ADHERIR_INCIDENTE]);
const ROL_OPERADOR = new Rol('OPERADOR', [Permiso.GESTIONAR_INCIDENTES, Permiso.ASIGNAR_CUADRILLAS]);
const ROL_CUADRILLA = new Rol('CUADRILLA', [Permiso.EJECUTAR_TRABAJOS]);

export const OPERADORA = new Usuario('operadora.carla', ROL_OPERADOR);
export const MIEMBRO_NORTE = new Usuario('cuadrilla.norte.1', ROL_CUADRILLA);
export const MIEMBRO_LUMINARIAS = new Usuario('cuadrilla.luminarias.1', ROL_CUADRILLA);

export const ANA = new Vecino('Ana', new Usuario('vecina.ana', ROL_VECINO), 'Almagro', TipoCanal.WHATSAPP);
export const BRUNO = new Vecino('Bruno', new Usuario('vecino.bruno', ROL_VECINO), 'Almagro', TipoCanal.EMAIL);

export const BACHE = new TipoIncidente('Bache', 48);
export const LUMINARIA = new TipoIncidente('Luminaria', 72);

export const MEDRANO_950 = new Ubicacion(-34.5986, -58.4202, 'Av. Medrano 950', 'Almagro');
export const OBELISCO = new Ubicacion(-34.6037, -58.3816, 'Av. Corrientes y 9 de Julio', 'San Nicolás');

export const NORTE = new Cuadrilla('Norte', MEDRANO_950, [BACHE], [MIEMBRO_NORTE]);
export const LUMINARIAS = new Cuadrilla('Luminarias', OBELISCO, [LUMINARIA], [MIEMBRO_LUMINARIAS]);

export function evidencia(fecha: Date): Evidencia {
  return new Evidencia('fotos/bache-reparado.jpg', 'Bache rellenado', MIEMBRO_NORTE, fecha);
}

export function unBache(): IncidenteBuilder {
  return new IncidenteBuilder();
}

/** Builder de datos de prueba */
class IncidenteBuilder {
  private reportante = ANA;
  private ahora = INICIO;

  reportadoPor(vecino: Vecino): this {
    this.reportante = vecino;
    return this;
  }

  el(fecha: Date): this {
    this.ahora = fecha;
    return this;
  }

  reportado(): Incidente {
    return Incidente.reportar(BACHE, 'Bache profundo en la mano que va al centro', MEDRANO_950, this.reportante, this.ahora);
  }

  /** Construye el incidente y lo lleva al estado pedido recorriendo el camino feliz. */
  en(estado: NombreEstado): Incidente {
    const incidente = this.reportado();
    if (estado === 'RECHAZADO') {
      incidente.rechazar(OPERADORA, 'Está en propiedad privada', this.ahora);
    } else if (estado === 'DUPLICADO') {
      incidente.marcarDuplicadoDe(this.reportado(), OPERADORA, this.ahora);
    } else if (estado !== 'REPORTADO') {
      this.avanzarHasta(incidente, estado);
    }
    incidente.extraerEventos();
    return incidente;
  }

  private avanzarHasta(incidente: Incidente, estado: NombreEstado): void {
    const pasos: [NombreEstado, () => void][] = [
      ['VALIDADO', () => incidente.validar(OPERADORA, this.ahora)],
      ['ASIGNADO', () => incidente.asignar(NORTE, OPERADORA, this.ahora)],
      ['EN_CURSO', () => incidente.iniciarTrabajo(MIEMBRO_NORTE, this.ahora)],
      ['RESUELTO', () => incidente.resolver(MIEMBRO_NORTE, evidencia(this.ahora), this.ahora)],
      ['CERRADO', () => incidente.cerrar(this.reportante.usuario, this.ahora)],
    ];
    for (const [alcanzado, paso] of pasos) {
      paso();
      if (alcanzado === estado) {
        return;
      }
    }
  }
}
