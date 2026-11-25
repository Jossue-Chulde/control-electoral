import { Acta, EstadoMesa, Mesa } from '../models/electoral.model';

export function estadoMesa(m: Mesa, actas: Acta[]): EstadoMesa {
  const n = actas.filter((a) => a.mesa_id === m.id).length;
  if (n >= 2) return 'Completa';
  if (n === 1) return 'Acta parcial';
  return m.veedor_id ? 'Asignada' : 'Sin asignar';
}

export const COLOR_ESTADO: Record<EstadoMesa, string> = {
  'Sin asignar': 'medium', Asignada: 'warning', 'Acta parcial': 'tertiary', Completa: 'success',
};
