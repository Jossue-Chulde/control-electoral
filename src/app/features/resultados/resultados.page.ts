import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonItem, IonLabel, IonNote, IonProgressBar, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, IonButton } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { Datos, DatosService } from '../../core/services/datos.service';
import { Cargo } from '../../shared/models/electoral.model';
import { avancePorRecinto, votosPorCandidato } from './resultados.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonSelect, IonSelectOption, IonItem, IonNote, IonProgressBar, IonSpinner, IonButton],
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>Resultados</ion-title></ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="vista()" (ionChange)="vista.set($any($event).detail.value)">
          <ion-segment-button value="votos"><ion-label>Votos</ion-label></ion-segment-button>
          <ion-segment-button value="avance"><ion-label>Avance y GPS</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @switch (estado()) {
        @case ('cargando') { <div class="centro"><ion-spinner></ion-spinner><p>Cargando…</p></div> }
        @case ('error') { <div class="centro"><p class="error">{{ mensaje() }}</p><ion-button (click)="cargar()">Reintentar</ion-button></div> }
        @default {
          @if (vista() === 'votos') {
            @if (esProvincial) {
              <ion-select label="Recinto" labelPlacement="floating" interface="popover" [value]="recinto()" (ionChange)="recinto.set($any($event).detail.value)">
                <ion-select-option value="todos">Consolidado (todos los recintos)</ion-select-option>
                @for (r of datos()!.recintos; track r.id) { <ion-select-option [value]="'' + r.id">{{ r.nombre }}</ion-select-option> }
              </ion-select>
            }
            <ion-segment class="ion-margin-top" [value]="cargo()" (ionChange)="cargo.set($any($event).detail.value)">
              <ion-segment-button value="alcalde"><ion-label>Alcaldía</ion-label></ion-segment-button>
              <ion-segment-button value="prefecto"><ion-label>Prefectura</ion-label></ion-segment-button>
            </ion-segment>
            @if (res(); as r) {
              <p class="ion-margin-top"><small>Actas contabilizadas: {{ r.actas }}</small></p>
              @for (f of r.filas; track f.candidato) {
                <div class="ion-margin-bottom">
                  <strong>{{ f.candidato }}</strong> <small>· {{ f.organizacion }}</small>
                  <div class="barra-fondo"><div class="barra" [style.width.%]="pct(f.votos)"></div></div>
                  <small>{{ f.votos }} votos ({{ pct(f.votos) }}%)</small>
                </div>
              }
              <ion-item lines="none"><ion-label>Nulos</ion-label><ion-note slot="end">{{ r.nulos }}</ion-note></ion-item>
              <ion-item lines="none"><ion-label>Blancos</ion-label><ion-note slot="end">{{ r.blancos }}</ion-note></ion-item>
              <ion-item lines="none"><ion-label><strong>Total sufragantes</strong></ion-label><ion-note slot="end">{{ r.sufragantes }}</ion-note></ion-item>
            }
          } @else {
            <h3>Avance de actas por recinto</h3>
            @for (a of avance(); track a.recinto.id) {
              <ion-item lines="none">
                <ion-label>
                  <h2>{{ a.recinto.nombre }}</h2>
                  <p>{{ a.actas }} de {{ a.total }} actas · {{ a.mesas }} JRV</p>
                  <ion-progress-bar [value]="a.pct / 100"></ion-progress-bar>
                </ion-label>
                <ion-note slot="end">{{ a.pct }}%</ion-note>
              </ion-item>
            }
            <h3 class="ion-margin-top">Ubicación GPS de las actas</h3>
            @for (g of gps(); track g.id) {
              <ion-item [href]="g.url" target="_blank">
                <ion-label><h3>{{ g.recinto }} · Mesa {{ g.mesa }}</h3><p>{{ g.cargo }} · {{ g.lat }}, {{ g.lng }}</p></ion-label>
                <ion-note slot="end" color="primary">Ver mapa</ion-note>
              </ion-item>
            } @empty { <p>Aún no hay actas con ubicación.</p> }
          }
        }
      }
    </ion-content>
  `,
})
export class ResultadosPage implements OnInit {
  private datosSrv = inject(DatosService);
  private auth = inject(AuthService);
  esProvincial = this.auth.usuarioActual()?.rol === 'provincial';
  vista = signal<'votos' | 'avance'>('votos');
  cargo = signal<Cargo>('alcalde');
  recinto = signal('todos');
  estado = signal<'cargando' | 'ok' | 'error'>('cargando');
  mensaje = signal('');
  datos = signal<Datos | null>(null);

  res = computed(() => {
    const d = this.datos();
    return d ? votosPorCandidato(d, this.cargo(), this.recinto() === 'todos' ? null : +this.recinto()) : null;
  });
  avance = computed(() => (this.datos() ? avancePorRecinto(this.datos()!) : []));
  gps = computed(() => {
    const d = this.datos();
    if (!d) return [];
    return d.actas.filter((a) => a.gps_lat != null).map((a) => {
      const m = d.mesas.find((x) => x.id === a.mesa_id)!;
      return { id: a.id, mesa: m.numero, cargo: a.cargo, recinto: d.recintos.find((r) => r.id === m.recinto_id)?.nombre ?? '',
        lat: a.gps_lat!.toFixed(5), lng: a.gps_lng!.toFixed(5), url: `https://www.google.com/maps?q=${a.gps_lat},${a.gps_lng}` };
    });
  });

  pct(v: number) {
    const t = this.res()?.filas.reduce((s, f) => s + f.votos, 0) ?? 0;
    return t ? Math.round((v / t) * 1000) / 10 : 0;
  }

  ngOnInit() { void this.cargar(); }
  async cargar() {
    this.estado.set('cargando');
    try {
      const d = await this.datosSrv.cargar();
      this.datos.set(d);
      this.estado.set('ok');
    } catch (e) { this.mensaje.set(e instanceof Error ? e.message : 'Error'); this.estado.set('error'); }
  }
}
