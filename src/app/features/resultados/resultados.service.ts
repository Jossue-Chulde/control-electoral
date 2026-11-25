import { Cargo } from '../../shared/models/electoral.model';
import { Datos } from '../../core/services/datos.service';

export function votosPorCandidato(d: Datos, cargo: Cargo, recintoId: number | null) {
  const mesas = new Set(d.mesas.filter((m) => recintoId == null || m.recinto_id === recintoId).map((m) => m.id));
  const actas = d.actas.filter((a) => a.cargo === cargo && mesas.has(a.mesa_id));
  const ids = new Set(actas.map((a) => a.id));
  const filas = d.candidaturas.filter((c) => c.cargo === cargo).map((c) => ({
    candidato: c.candidato,
    organizacion: d.organizaciones.find((o) => o.id === c.organizacion_id)?.nombre ?? '',
    votos: d.votos.filter((v) => ids.has(v.acta_id) && v.candidatura_id === c.id).reduce((s, v) => s + v.votos, 0),
  })).sort((a, b) => b.votos - a.votos);
  const sum = (k: 'nulos' | 'blancos' | 'sufragantes') => actas.reduce((s, a) => s + a[k], 0);
  return { filas, nulos: sum('nulos'), blancos: sum('blancos'), sufragantes: sum('sufragantes'), actas: actas.length };
}

export function avancePorRecinto(d: Datos) {
  return d.recintos.map((r) => {
    const ms = d.mesas.filter((m) => m.recinto_id === r.id), ids = new Set(ms.map((m) => m.id));
    const n = d.actas.filter((a) => ids.has(a.mesa_id)).length, total = ms.length * 2;
    return { recinto: r, mesas: ms.length, actas: n, total, pct: total ? Math.round((n / total) * 100) : 0 };
  });
}
