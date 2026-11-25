import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBadge, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { Datos, DatosService } from '../../core/services/datos.service';
import { ActasService } from '../actas/actas.service';
import { Cargo, Mesa } from '../../shared/models/electoral.model';
import { COLOR_ESTADO, estadoMesa } from '../../shared/utils/mesa';

@Component({
  selector: 'app-mis-mesas',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonSpinner],
  template: `
    <ion-header><ion-toolbar color="primary"><ion-title>Mis mesas</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (actas.pendientes().length) {
        <ion-badge color="warning">{{ actas.pendientes().length }} acta(s) pendiente(s) de sincronizar</ion-badge>
      }
      @switch (estado()) {
        @case ('cargando') { <div class="centro"><ion-spinner></ion-spinner><p>Cargando mesas…</p></div> }
        @case ('error') { <div class="centro"><p class="error">{{ mensaje() }}</p><ion-button (click)="cargar()">Reintentar</ion-button></div> }
        @default {
          <ion-list>
            @for (m of datos()!.mesas; track m.id) {
              <ion-item>
                <ion-label>
                  <h2>Mesa {{ m.numero }} <ion-badge [color]="color(m)">{{ est(m) }}</ion-badge></h2>
                  <p>{{ recinto(m) }}</p>
                  @for (c of cargos; track c) {
                    <ion-button size="small" [fill]="hayActa(m, c) ? 'outline' : 'solid'" [routerLink]="['/acta', m.id, c]">
                      {{ hayActa(m, c) ? 'Corregir ' : 'Registrar ' }}{{ c }}
                    </ion-button>
                  }
                </ion-label>
              </ion-item>
            } @empty { <p class="centro">No tiene mesas asignadas todavía.</p> }
          </ion-list>
        }
      }
    </ion-content>
  `,
})
export class MisMesasPage implements OnInit {
  private datosSrv = inject(DatosService);
  actas = inject(ActasService);
  cargos: Cargo[] = ['alcalde', 'prefecto'];
  estado = signal<'cargando' | 'ok' | 'error'>('cargando');
  mensaje = signal('');
  datos = signal<Datos | null>(null);

  ngOnInit() { void this.cargar(); }
  // Se recarga al volver desde el formulario de acta.
  ionViewWillEnter() { if (this.datos()) void this.cargar(); }
  est(m: Mesa) { return estadoMesa(m, this.datos()!.actas); }
  color(m: Mesa) { return COLOR_ESTADO[this.est(m)]; }
  hayActa(m: Mesa, c: Cargo) { return this.datos()!.actas.some((a) => a.mesa_id === m.id && a.cargo === c); }
  recinto(m: Mesa) { return this.datos()!.recintos.find((r) => r.id === m.recinto_id)?.nombre ?? ''; }

  async cargar() {
    if (!this.datos()) this.estado.set('cargando');
    try { this.datos.set(await this.datosSrv.cargar()); this.estado.set('ok'); }
    catch (e) { this.mensaje.set(e instanceof Error ? e.message : 'Error'); this.estado.set('error'); }
  }
}
