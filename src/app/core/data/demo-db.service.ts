import { Injectable, signal } from '@angular/core';
import { Acta, ActaEdicion, ActaEntrada, ActaVoto, Candidatura, Cargo, Mesa, Organizacion, Parroquia, Recinto } from '../../shared/models/electoral.model';
import { Rol, Usuario } from '../../shared/models/usuario.model';
import { NuevoUsuario, completarCedula, validarClave, validarNuevoUsuario } from '../../shared/validators/validators';

export const CLAVE_INICIAL = 'Ecuador2026';
const KEY = 'ce_demo_db_v1';
const SK = 'ce_demo_sesion';

export class ErrorRls extends Error {
  readonly status = 403;
  constructor(m = '403 · RLS: no tiene permiso para esta operación') { super(m); }
}
export class ErrorConflicto extends Error {}

export interface Db {
  provincias: { id: number; nombre: string }[];
  cantones: { id: number; provincia_id: number; nombre: string }[];
  parroquias: Parroquia[];
  perfiles: Usuario[];
  organizaciones: Organizacion[];
  candidaturas: Candidatura[];
  recintos: Recinto[];
  mesas: Mesa[];
  actas: Acta[];
  acta_votos: ActaVoto[];
  acta_ediciones: ActaEdicion[];
}
interface Almacen extends Db { claves: Record<string, string>; }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const sigId = (a: { id: number }[]) => a.reduce((m, x) => Math.max(m, x.id), 0) + 1;
const placeholder = (t: string) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="#e8edf2"/><rect x="20" y="20" width="440" height="280" fill="none" stroke="#6b7a8c" stroke-dasharray="6"/><text x="240" y="165" font-family="Arial" font-size="22" text-anchor="middle" fill="#334155">${t}</text></svg>`);

function semilla(): Almacen {
  const ced = (n: number) => completarCedula('17100' + String(n).padStart(4, '0'));
  const per = (id: string, n: number, rol: Rol, nom: string, ape: string, rid: number | null): Usuario => ({
    id, cedula: ced(n), nombres: nom, apellidos: ape, telefono: '09' + (80000000 + n),
    correo: `${nom}.${ape}@demo.ec`.toLowerCase(), rol, recinto_id: rid, debe_cambiar_clave: false,
  });
  const perfiles = [
    per('u-prov', 1, 'provincial', 'Marcela', 'Vega', null),
    per('u-c1', 2, 'coordinador', 'Luis', 'Paredes', 1),
    per('u-c2', 3, 'coordinador', 'Ana', 'Salazar', 2),
    per('u-v1', 4, 'veedor', 'Diego', 'Moreno', 1),
    per('u-v2', 5, 'veedor', 'Paola', 'Rivera', 1),
  ];
  const claves: Record<string, string> = {};
  perfiles.forEach((p) => (claves[p.id] = CLAVE_INICIAL));

  const parroquias: Parroquia[] = ['Iñaquito', 'Cotocollao', 'Calderón', 'Tumbaco', 'Conocoto'].map((n, i) => ({ id: i + 1, canton_id: 1, nombre: n }));
  const recintos: Recinto[] = [
    { id: 1, parroquia_id: 1, nombre: 'Colegio Mejía', cantidad_jrv: 5, coordinador_id: 'u-c1' },
    { id: 2, parroquia_id: 2, nombre: 'U.E. Cotocollao', cantidad_jrv: 4, coordinador_id: 'u-c2' },
    { id: 3, parroquia_id: 3, nombre: 'Escuela Calderón', cantidad_jrv: 6, coordinador_id: null },
    { id: 4, parroquia_id: 4, nombre: 'Colegio Tumbaco', cantidad_jrv: 3, coordinador_id: null },
    { id: 5, parroquia_id: 5, nombre: 'Coliseo Conocoto', cantidad_jrv: 4, coordinador_id: null },
  ];
  const mesas: Mesa[] = [];
  recintos.forEach((r) => { for (let n = 1; n <= r.cantidad_jrv; n++) mesas.push({ id: mesas.length + 1, recinto_id: r.id, numero: n, veedor_id: r.id === 1 && n <= 2 ? 'u-v1' : r.id === 1 && n === 3 ? 'u-v2' : null }); });

  const orgs = ['Movimiento Raíces', 'Alianza Ciudadana', 'Unidad Popular', 'Frente Renovación', 'Partido Horizonte'];
  const alc = ['Fernando Ortega', 'Gabriela Mena', 'Ricardo Lasso', 'Verónica Cueva', 'Andrés Balarezo'];
  const pref = ['Patricio Cevallos', 'Lorena Ibarra', 'Esteban Vallejo', 'Mónica Terán', 'Santiago Proaño'];
  const organizaciones = orgs.map((nombre, i) => ({ id: i + 1, nombre }));
  const candidaturas: Candidatura[] = [];
  orgs.forEach((_, i) => candidaturas.push(
    { id: i * 2 + 1, organizacion_id: i + 1, cargo: 'alcalde', candidato: alc[i] },
    { id: i * 2 + 2, organizacion_id: i + 1, cargo: 'prefecto', candidato: pref[i] }));

  const actas: Acta[] = []; const acta_votos: ActaVoto[] = [];
  const plan: [number, Cargo[]][] = [[1, ['alcalde', 'prefecto']], [2, ['alcalde', 'prefecto']], [3, ['alcalde']]];
  for (const [m, cargos] of plan) for (const c of cargos) {
    const v = [30, 25, 18, 12, 9].map((b, i) => b + ((m * 7 + i * 3 + (c === 'alcalde' ? 0 : 2)) % 9));
    const nulos = 3 + m, blancos = 2 + (m % 3), id = actas.length + 1;
    actas.push({ id, mesa_id: m, cargo: c, nulos, blancos, sufragantes: v.reduce((a, b) => a + b, 0) + nulos + blancos,
      foto_url: placeholder(`Acta Mesa ${m} - ${c}`), gps_lat: -0.1807 + m * 0.0004, gps_lng: -78.4678,
      creada_por: m < 3 ? 'u-v1' : 'u-v2', creada_en: new Date(Date.now() - (4 - m) * 3600000).toISOString() });
    candidaturas.filter((x) => x.cargo === c).forEach((cc, i) => acta_votos.push({ acta_id: id, candidatura_id: cc.id, votos: v[i] }));
  }
  return { provincias: [{ id: 1, nombre: 'Pichincha' }], cantones: [{ id: 1, provincia_id: 1, nombre: 'Quito' }], parroquias,
    perfiles, claves, organizaciones, candidaturas, recintos, mesas, actas, acta_votos, acta_ediciones: [] };
}

/**
 * Capa de acceso a datos en MODO DEMO. Simula el backend (Supabase): latencia de red,
 * sesión, y reglas de acceso por rol/pertenencia (equivalente a RLS) aplicadas AQUÍ,
 * no en las pantallas. Para pasar a Supabase solo se reemplaza este servicio.
 */
@Injectable({ providedIn: 'root' })
export class DemoDbService {
  private db: Almacen = this.cargar();
  readonly usuario = signal<Usuario | null>(null);

  constructor() {
    const id = localStorage.getItem(SK);
    if (id) this.usuario.set(this.db.perfiles.find((p) => p.id === id) ?? null);
  }

  private cargar(): Almacen {
    try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r) as Almacen; } catch { /* ignora */ }
    return semilla();
  }
  private guardar() { localStorage.setItem(KEY, JSON.stringify(this.db)); }
  private async red<T>(fn: () => T): Promise<T> {
    await new Promise((r) => setTimeout(r, 250));
    const out = fn();
    this.guardar();
    return out;
  }
  private yo(): Usuario {
    const u = this.usuario();
    if (!u) throw new ErrorRls('401 · Sesión no iniciada');
    return u;
  }
  private exigir(rol: Rol): Usuario {
    const u = this.yo();
    if (u.rol !== rol) throw new ErrorRls();
    return u;
  }

  /** Vista de datos permitida para el usuario (políticas de lectura). */
  private vista(): Db {
    const u = this.yo(), d = this.db;
    if (u.rol === 'provincial') return d;
    const mesas = u.rol === 'coordinador' ? d.mesas.filter((m) => m.recinto_id === u.recinto_id) : d.mesas.filter((m) => m.veedor_id === u.id);
    const mi = new Set(mesas.map((m) => m.id));
    const actas = d.actas.filter((a) => mi.has(a.mesa_id));
    const ai = new Set(actas.map((a) => a.id));
    const ri = new Set(mesas.map((m) => m.recinto_id));
    return { ...d, mesas, actas,
      recintos: d.recintos.filter((r) => ri.has(r.id)),
      acta_votos: d.acta_votos.filter((v) => ai.has(v.acta_id)),
      acta_ediciones: d.acta_ediciones.filter((e) => ai.has(e.acta_id)),
      perfiles: d.perfiles.filter((p) => p.id === u.id || (u.rol === 'coordinador' && p.recinto_id === u.recinto_id)) };
  }

  listar<K extends keyof Db>(t: K): Promise<Db[K]> {
    return this.red(() => structuredClone(this.vista()[t]));
  }
  probarAcceso(mesaId: number): Promise<Mesa> {
    return this.red(() => {
      const m = this.vista().mesas.find((x) => x.id === mesaId);
      if (!m) throw new ErrorRls(`403 · RLS: la mesa ${mesaId} no pertenece a su asignación`);
      return { ...m };
    });
  }
  mesaAjena(): number | null {
    const u = this.yo();
    return this.db.mesas.find((m) => m.veedor_id !== u.id)?.id ?? null;
  }

  // ---- Autenticación ----
  login(cedula: string, clave: string): Promise<Usuario> {
    return this.red(() => {
      const p = this.db.perfiles.find((x) => x.cedula === cedula.trim());
      if (!p || this.db.claves[p.id] !== clave) throw new Error('Cédula o contraseña incorrecta');
      localStorage.setItem(SK, p.id);
      this.usuario.set({ ...p });
      return { ...p };
    });
  }
  logout() { localStorage.removeItem(SK); this.usuario.set(null); }
  cambiarClave(nueva: string): Promise<void> {
    return this.red(() => {
      const u = this.yo();
      const err = validarClave(nueva, CLAVE_INICIAL);
      if (err) throw new Error(err);
      const p = this.db.perfiles.find((x) => x.id === u.id)!;
      this.db.claves[p.id] = nueva; p.debe_cambiar_clave = false;
      this.usuario.set({ ...p });
    });
  }
  recuperar(cedula: string): Promise<void> {
    return this.red(() => {
      const p = this.db.perfiles.find((x) => x.cedula === cedula.trim());
      if (p) { this.db.claves[p.id] = CLAVE_INICIAL; p.debe_cambiar_clave = true; }
    });
  }
  reiniciar() { localStorage.removeItem(KEY); localStorage.removeItem(SK); localStorage.removeItem('ce_demo_cola'); }

  // ---- Gestión de recintos y usuarios ----
  private nuevoPerfil(u: NuevoUsuario, rol: Rol, rid: number): Usuario {
    const err = validarNuevoUsuario(u);
    if (err) throw new Error(err);
    if (this.db.perfiles.some((p) => p.cedula === u.cedula.trim())) throw new Error('Ya existe un usuario con esa cédula');
    const p: Usuario = { id: uid(), cedula: u.cedula.trim(), nombres: u.nombres.trim(), apellidos: u.apellidos.trim(),
      telefono: u.telefono.trim(), correo: u.correo.trim(), rol, recinto_id: rid, debe_cambiar_clave: true };
    this.db.perfiles.push(p); this.db.claves[p.id] = CLAVE_INICIAL;
    return p;
  }

  crearRecinto(r: { parroquia_id: number; nombre: string; cantidad_jrv: number }, coord: NuevoUsuario): Promise<Recinto> {
    return this.red(() => {
      this.exigir('provincial');
      if (!r.nombre.trim()) throw new Error('El nombre del recinto es obligatorio');
      if (!this.db.parroquias.some((p) => p.id === r.parroquia_id)) throw new Error('Seleccione una parroquia');
      if (!Number.isInteger(r.cantidad_jrv) || r.cantidad_jrv < 1 || r.cantidad_jrv > 30) throw new Error('La cantidad de JRV debe estar entre 1 y 30');
      const id = sigId(this.db.recintos);
      const c = this.nuevoPerfil(coord, 'coordinador', id);
      const rec: Recinto = { id, parroquia_id: r.parroquia_id, nombre: r.nombre.trim(), cantidad_jrv: r.cantidad_jrv, coordinador_id: c.id };
      this.db.recintos.push(rec);
      for (let n = 1; n <= r.cantidad_jrv; n++) this.db.mesas.push({ id: sigId(this.db.mesas), recinto_id: id, numero: n, veedor_id: null });
      return { ...rec };
    });
  }
  crearCoordinador(recintoId: number, coord: NuevoUsuario): Promise<void> {
    return this.red(() => {
      this.exigir('provincial');
      const r = this.db.recintos.find((x) => x.id === recintoId);
      if (!r) throw new Error('Recinto no encontrado');
      if (r.coordinador_id) throw new Error('El recinto ya tiene coordinador');
      r.coordinador_id = this.nuevoPerfil(coord, 'coordinador', recintoId).id;
    });
  }
  crearVeedor(v: NuevoUsuario): Promise<void> {
    return this.red(() => { const u = this.exigir('coordinador'); this.nuevoPerfil(v, 'veedor', u.recinto_id!); });
  }
  asignarMesa(mesaId: number, veedorId: string | null): Promise<void> {
    return this.red(() => {
      const u = this.exigir('coordinador');
      const m = this.db.mesas.find((x) => x.id === mesaId);
      if (!m || m.recinto_id !== u.recinto_id) throw new ErrorRls();
      if (veedorId && !this.db.perfiles.some((p) => p.id === veedorId && p.rol === 'veedor' && p.recinto_id === u.recinto_id)) throw new Error('Veedor no válido para este recinto');
      m.veedor_id = veedorId;
    });
  }

  // ---- Actas (equivale a una función RPC transaccional) ----
  guardarActa(e: ActaEntrada, ts?: string): Promise<Acta> {
    return this.red(() => {
      const u = this.yo();
      const mesa = this.db.mesas.find((m) => m.id === e.mesa_id);
      const ex = this.db.actas.find((a) => a.mesa_id === e.mesa_id && a.cargo === e.cargo);
      const permitido = !!mesa && ((u.rol === 'veedor' && mesa.veedor_id === u.id) || (u.rol === 'coordinador' && mesa.recinto_id === u.recinto_id && !!ex));
      if (!permitido) throw new ErrorRls(u.rol === 'coordinador' ? '403 · El coordinador solo puede corregir actas existentes de su recinto' : '403 · RLS: no puede registrar actas en mesas ajenas');

      const cands = this.db.candidaturas.filter((c) => c.cargo === e.cargo);
      const nums = [...cands.map((c) => e.votos[c.id]), e.nulos, e.blancos, e.sufragantes];
      if (nums.some((n) => !Number.isInteger(n) || n < 0)) throw new Error('Todos los valores deben ser enteros mayores o iguales a 0');
      const suma = cands.reduce((s, c) => s + e.votos[c.id], 0) + e.nulos + e.blancos;
      if (suma !== e.sufragantes) throw new Error(`Los totales no cuadran: votos + nulos + blancos = ${suma}, sufragantes = ${e.sufragantes}`);
      if (!e.foto_url) throw new Error('La fotografía del acta es obligatoria');

      if (ex && ts && this.ultimaModificacion(ex.id) > ts) throw new ErrorConflicto('Conflicto: el servidor tiene una versión más reciente del acta');

      const ahora = new Date().toISOString();
      let acta: Acta;
      if (ex) {
        const campos: string[] = [];
        (['nulos', 'blancos', 'sufragantes'] as const).forEach((k) => { if (ex[k] !== e[k]) campos.push(k); });
        if (ex.foto_url !== e.foto_url) campos.push('foto');
        if (e.gps_lat != null && (ex.gps_lat !== e.gps_lat || ex.gps_lng !== e.gps_lng)) campos.push('gps');
        cands.forEach((c) => { const prev = this.db.acta_votos.find((v) => v.acta_id === ex.id && v.candidatura_id === c.id)?.votos ?? 0; if (prev !== e.votos[c.id]) campos.push('votos:' + c.candidato); });
        Object.assign(ex, { nulos: e.nulos, blancos: e.blancos, sufragantes: e.sufragantes, foto_url: e.foto_url, gps_lat: e.gps_lat ?? ex.gps_lat, gps_lng: e.gps_lng ?? ex.gps_lng });
        if (campos.length) this.db.acta_ediciones.push({ id: sigId(this.db.acta_ediciones), acta_id: ex.id, editada_por: u.id, editada_en: ahora, cambios: JSON.stringify(campos) });
        acta = ex;
      } else {
        acta = { id: sigId(this.db.actas), mesa_id: e.mesa_id, cargo: e.cargo, nulos: e.nulos, blancos: e.blancos, sufragantes: e.sufragantes,
          foto_url: e.foto_url, gps_lat: e.gps_lat, gps_lng: e.gps_lng, creada_por: u.id, creada_en: ahora };
        this.db.actas.push(acta);
      }
      this.db.acta_votos = this.db.acta_votos.filter((v) => v.acta_id !== acta.id);
      cands.forEach((c) => this.db.acta_votos.push({ acta_id: acta.id, candidatura_id: c.id, votos: e.votos[c.id] }));
      return { ...acta };
    });
  }
  private ultimaModificacion(actaId: number): string {
    const a = this.db.actas.find((x) => x.id === actaId)!;
    return this.db.acta_ediciones.filter((e) => e.acta_id === actaId).reduce((m, e) => (e.editada_en > m ? e.editada_en : m), a.creada_en);
  }
}
