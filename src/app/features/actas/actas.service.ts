import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { DemoDbService, ErrorConflicto } from '../../core/data/demo-db.service';
import { ConexionService } from '../../core/services/conexion.service';
import { UiService } from '../../core/services/ui.service';
import { ActaEntrada } from '../../shared/models/electoral.model';

interface Pendiente { entrada: ActaEntrada; ts: string; usuario: string; }
const COLA = 'ce_demo_cola';

/**
 * R10 · Persistencia local + sincronización. Estrategia de conflictos: "el servidor gana si fue
 * modificado después de que se encoló el registro" (se descarta la versión local y se avisa).
 */
@Injectable({ providedIn: 'root' })
export class ActasService {
  private db = inject(DemoDbService);
  private con = inject(ConexionService);
  private ui = inject(UiService);
  readonly pendientes = signal<Pendiente[]>(this.leer());

  constructor() {
    effect(() => { if (this.con.activo() && this.db.usuario()) untracked(() => void this.sincronizar()); });
  }

  private leer(): Pendiente[] { try { return JSON.parse(localStorage.getItem(COLA) ?? '[]'); } catch { return []; } }
  private escribir(p: Pendiente[]) { localStorage.setItem(COLA, JSON.stringify(p)); this.pendientes.set(p); }

  async guardar(entrada: ActaEntrada): Promise<'guardada' | 'pendiente'> {
    if (!this.con.activo()) {
      const u = this.db.usuario()!;
      this.escribir([...this.leer().filter((p) => !(p.entrada.mesa_id === entrada.mesa_id && p.entrada.cargo === entrada.cargo)), { entrada, ts: new Date().toISOString(), usuario: u.id }]);
      return 'pendiente';
    }
    await this.db.guardarActa(entrada);
    return 'guardada';
  }

  async sincronizar() {
    const u = this.db.usuario();
    if (!u || !this.con.activo()) return;
    const mias = this.leer().filter((p) => p.usuario === u.id);
    if (!mias.length) return;
    let ok = 0, conflictos = 0;
    for (const p of mias) {
      try { await this.db.guardarActa(p.entrada, p.ts); ok++; }
      catch (e) { if (e instanceof ErrorConflicto) conflictos++; else void this.ui.error(e); }
    }
    this.escribir(this.leer().filter((p) => p.usuario !== u.id));
    void this.ui.toast(`Sincronización: ${ok} acta(s) enviada(s)` + (conflictos ? `, ${conflictos} con conflicto (prevaleció el servidor)` : ''), conflictos ? 'warning' : 'success');
  }
}
