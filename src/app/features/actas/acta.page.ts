import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { Datos, DatosService } from '../../core/services/datos.service';
import { DemoDbService } from '../../core/data/demo-db.service';
import { DispositivoService, UMBRAL_NITIDEZ } from '../../core/services/dispositivo.service';
import { UiService } from '../../core/services/ui.service';
import { Acta, Cargo, Mesa } from '../../shared/models/electoral.model';
import { ActasService } from './actas.service';

const num = (s: string) => (s.trim() === '' ? 0 : Number(s));

@Component({
  selector: 'app-acta',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonItem, IonInput, IonButton, IonSpinner],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs"></ion-back-button></ion-buttons>
        <ion-title>Acta {{ cargo }} · Mesa {{ mesa()?.numero ?? '' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @switch (estado()) {
        @case ('cargando') { <div class="centro"><ion-spinner></ion-spinner><p>Cargando acta…</p></div> }
        @case ('error') {
          <div class="centro"><h2 class="error">Acceso denegado</h2><p class="error">{{ mensaje() }}</p>
            <ion-button (click)="volver()">Volver</ion-button></div>
        }
        @default {
          @for (f of filas(); track f.id) {
            <ion-item>
              <ion-input [label]="f.candidato + ' (' + f.org + ')'" labelPlacement="stacked" type="number" inputmode="numeric" min="0"
                [value]="votos()[f.id]" (ionInput)="setVoto(f.id, $any($event).detail.value)"></ion-input>
            </ion-item>
          }
          <ion-item><ion-input label="Votos nulos" labelPlacement="stacked" type="number" inputmode="numeric" min="0" [value]="nulos()" (ionInput)="nulos.set($any($event).detail.value ?? '')"></ion-input></ion-item>
          <ion-item><ion-input label="Votos en blanco" labelPlacement="stacked" type="number" inputmode="numeric" min="0" [value]="blancos()" (ionInput)="blancos.set($any($event).detail.value ?? '')"></ion-input></ion-item>
          <ion-item><ion-input label="Total de sufragantes" labelPlacement="stacked" type="number" inputmode="numeric" min="0" [value]="sufragantes()" (ionInput)="sufragantes.set($any($event).detail.value ?? '')"></ion-input></ion-item>

          <p [class]="cuadra() ? 'ok' : 'error'">
            Suma (organizaciones + nulos + blancos): {{ suma() }} · Sufragantes: {{ num(sufragantes()) }}
            {{ cuadra() ? '✔ cuadra' : '✘ no cuadra' }}
          </p>

          <h3>Fotografía del acta</h3>
          @if (foto()) {
            <img [src]="foto()" alt="Foto del acta" style="max-width:100%;border-radius:8px" />
            @if (nitidez() !== null) { <p><small>Nitidez: {{ nitidez() }} (mínimo {{ umbral }})</small></p> }
          }
          <ion-button expand="block" fill="outline" [disabled]="ocupado()" (click)="tomarFoto()">{{ foto() ? 'Volver a tomar' : 'Tomar fotografía' }}</ion-button>

          <h3>Ubicación GPS</h3>
          @if (gps(); as g) { <p class="ok">{{ g.lat.toFixed(5) }}, {{ g.lng.toFixed(5) }}</p> } @else { <p class="error">Sin ubicación</p> }
          @if (errorGps()) { <p class="error">{{ errorGps() }}</p> }
          <ion-button expand="block" fill="outline" [disabled]="ocupado()" (click)="obtenerGps()">Obtener ubicación</ion-button>
          @if (errorGps()) { <ion-button expand="block" fill="clear" size="small" (click)="gpsDemo()">Usar ubicación simulada (demo)</ion-button> }

          @for (p of erroresForm(); track p) { <p class="error">• {{ p }}</p> }
          <ion-button expand="block" class="ion-margin-top" [disabled]="guardando() || erroresForm().length > 0" (click)="guardar()">
            @if (guardando()) { <ion-spinner name="dots"></ion-spinner> } @else { {{ existente() ? 'Guardar corrección' : 'Guardar acta' }} }
          </ion-button>

          @if (historial().length) {
            <h3 class="ion-margin-top">Historial de ediciones</h3>
            <p><small>Creada por {{ nombre(existente()!.creada_por) }} el {{ fecha(existente()!.creada_en) }}</small></p>
            @for (h of historial(); track h.id) { <p><small>{{ nombre(h.editada_por) }} · {{ fecha(h.editada_en) }} · {{ h.cambios }}</small></p> }
          }
        }
      }
    </ion-content>
  `,
})
export class ActaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private datosSrv = inject(DatosService);
  private db = inject(DemoDbService);
  private auth = inject(AuthService);
  private disp = inject(DispositivoService);
  private actasSrv = inject(ActasService);
  private ui = inject(UiService);
  private alerts = inject(AlertController);

  mesaId = Number(this.route.snapshot.paramMap.get('mesaId'));
  cargo = this.route.snapshot.paramMap.get('cargo') as Cargo;
  umbral = UMBRAL_NITIDEZ;
  num = num;

  estado = signal<'cargando' | 'ok' | 'error'>('cargando');
  mensaje = signal('');
  mesa = signal<Mesa | null>(null);
  datos = signal<Datos | null>(null);
  votos = signal<Record<number, string>>({});
  nulos = signal('0');
  blancos = signal('0');
  sufragantes = signal('0');
  foto = signal('');
  nitidez = signal<number | null>(null);
  gps = signal<{ lat: number; lng: number } | null>(null);
  errorGps = signal('');
  ocupado = signal(false);
  guardando = signal(false);

  filas = computed(() => (this.datos()?.candidaturas ?? []).filter((c) => c.cargo === this.cargo).map((c) => ({
    id: c.id, candidato: c.candidato, org: this.datos()!.organizaciones.find((o) => o.id === c.organizacion_id)?.nombre ?? '' })));
  existente = computed<Acta | null>(() => this.datos()?.actas.find((a) => a.mesa_id === this.mesaId && a.cargo === this.cargo) ?? null);
  historial = computed(() => { const e = this.existente(); return e ? (this.datos()?.ediciones ?? []).filter((x) => x.acta_id === e.id) : []; });
  suma = computed(() => this.filas().reduce((s, f) => s + num(this.votos()[f.id] ?? '0'), 0) + num(this.nulos()) + num(this.blancos()));
  cuadra = computed(() => this.suma() === num(this.sufragantes()));
  erroresForm = computed(() => {
    const e: string[] = [];
    const vals = [...this.filas().map((f) => num(this.votos()[f.id] ?? '0')), num(this.nulos()), num(this.blancos()), num(this.sufragantes())];
    if (vals.some((v) => !Number.isInteger(v) || v < 0)) e.push('Todos los valores deben ser enteros ≥ 0');
    if (!this.cuadra()) e.push('Los totales no cuadran: el acta no se puede guardar');
    if (!this.foto()) e.push('Falta la fotografía del acta');
    if (!this.gps()) e.push('Falta la ubicación GPS');
    return e;
  });

  async ngOnInit() {
    try {
      // La verificación de acceso la hace la capa de datos (equivale a RLS), no la pantalla.
      this.mesa.set(await this.db.probarAcceso(this.mesaId));
      const d = await this.datosSrv.cargar();
      this.datos.set(d);
      const ex = this.existente();
      const v: Record<number, string> = {};
      this.filas().forEach((f) => (v[f.id] = '0'));
      if (ex) {
        d.votos.filter((x) => x.acta_id === ex.id).forEach((x) => (v[x.candidatura_id] = String(x.votos)));
        this.nulos.set(String(ex.nulos)); this.blancos.set(String(ex.blancos)); this.sufragantes.set(String(ex.sufragantes));
        this.foto.set(ex.foto_url);
        if (ex.gps_lat != null) this.gps.set({ lat: ex.gps_lat, lng: ex.gps_lng! });
      }
      this.votos.set(v);
      this.estado.set('ok');
      if (!ex) void this.obtenerGps();
    } catch (e) { this.mensaje.set(e instanceof Error ? e.message : 'Error'); this.estado.set('error'); }
  }

  setVoto(id: number, v: string | null | undefined) { this.votos.update((o) => ({ ...o, [id]: v ?? '' })); }
  nombre(id: string) { const p = this.datos()?.perfiles.find((x) => x.id === id); return p ? `${p.nombres} ${p.apellidos}` : 'Usuario'; }
  fecha(iso: string) { return new Date(iso).toLocaleString('es-EC'); }
  volver() { void this.router.navigateByUrl(this.auth.rutaInicio(this.auth.usuarioActual()!), { replaceUrl: true }); }

  async tomarFoto() {
    this.ocupado.set(true);
    try {
      const f = await this.disp.tomarFoto();
      const n = await this.disp.nitidez(f);
      if (n >= UMBRAL_NITIDEZ) { this.foto.set(f); this.nitidez.set(n); }
      else {
        const a = await this.alerts.create({ header: 'Foto borrosa', message: `Nitidez ${n} (mínimo ${UMBRAL_NITIDEZ}). Tome la foto de nuevo con mejor enfoque.`,
          buttons: ['Repetir', { text: 'Aceptar igualmente (demo)', handler: () => { this.foto.set(f); this.nitidez.set(n); } }] });
        await a.present();
      }
    } catch (e) { if (!(e instanceof Error && /cancelada/.test(e.message))) void this.ui.error(e); } finally { this.ocupado.set(false); }
  }

  async obtenerGps() {
    this.ocupado.set(true); this.errorGps.set('');
    try { this.gps.set(await this.disp.ubicacion()); }
    catch (e) { this.errorGps.set(e instanceof Error ? e.message : 'Error de ubicación'); } finally { this.ocupado.set(false); }
  }
  gpsDemo() { this.gps.set({ lat: -0.1807 + Math.random() * 0.01, lng: -78.4678 + Math.random() * 0.01 }); this.errorGps.set(''); }

  async guardar() {
    this.guardando.set(true);
    const votos: Record<number, number> = {};
    this.filas().forEach((f) => (votos[f.id] = num(this.votos()[f.id] ?? '0')));
    try {
      const r = await this.actasSrv.guardar({ mesa_id: this.mesaId, cargo: this.cargo, votos, nulos: num(this.nulos()), blancos: num(this.blancos()),
        sufragantes: num(this.sufragantes()), foto_url: this.foto(), gps_lat: this.gps()?.lat ?? null, gps_lng: this.gps()?.lng ?? null });
      void this.ui.toast(r === 'guardada' ? 'Acta guardada correctamente' : 'Sin conexión: acta guardada localmente, se sincronizará automáticamente', r === 'guardada' ? 'success' : 'warning');
      this.volver();
    } catch (e) { void this.ui.error(e); } finally { this.guardando.set(false); }
  }
}
