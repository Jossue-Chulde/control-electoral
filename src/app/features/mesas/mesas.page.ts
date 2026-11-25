import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonBadge, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { Datos, DatosService } from '../../core/services/datos.service';
import { UiService } from '../../core/services/ui.service';
import { Cargo, Mesa } from '../../shared/models/electoral.model';
import { COLOR_ESTADO, estadoMesa } from '../../shared/utils/mesa';
import { UsuariosService } from '../usuarios/usuarios.service';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonBadge, IonButton, IonSelect, IonSelectOption, IonInput, IonSpinner],
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>{{ recinto()?.nombre ?? 'Mi recinto' }}</ion-title></ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="vista()" (ionChange)="vista.set($any($event).detail.value)">
          <ion-segment-button value="mesas"><ion-label>Mesas</ion-label></ion-segment-button>
          <ion-segment-button value="veedores"><ion-label>Veedores</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @switch (estado()) {
        @case ('cargando') { <div class="centro"><ion-spinner></ion-spinner><p>Cargando…</p></div> }
        @case ('error') { <div class="centro"><p class="error">{{ mensaje() }}</p><ion-button (click)="cargar()">Reintentar</ion-button></div> }
        @default {
          @if (vista() === 'mesas') {
            <ion-list>
              @for (m of datos()!.mesas; track m.id) {
                <ion-item>
                  <ion-label>
                    <h2>Mesa {{ m.numero }} <ion-badge [color]="color(m)">{{ estado_(m) }}</ion-badge></h2>
                    <ion-select label="Veedor" interface="popover" placeholder="Sin asignar" [value]="m.veedor_id" (ionChange)="asignar(m, $any($event).detail.value)">
                      <ion-select-option [value]="null">Sin asignar</ion-select-option>
                      @for (v of veedores(); track v.id) { <ion-select-option [value]="v.id">{{ v.nombres }} {{ v.apellidos }}</ion-select-option> }
                    </ion-select>
                    @for (c of cargos; track c) {
                      @if (hayActa(m, c)) {
                        <ion-button size="small" fill="outline" [routerLink]="['/acta', m.id, c]">Corregir {{ c }}</ion-button>
                      }
                    }
                  </ion-label>
                </ion-item>
              }
            </ion-list>
          } @else {
            <h3>Nuevo veedor</h3>
            <ion-item><ion-input label="Cédula" labelPlacement="floating" inputmode="numeric" maxlength="10" [(ngModel)]="nv.cedula"></ion-input></ion-item>
            <ion-item><ion-input label="Nombres" labelPlacement="floating" [(ngModel)]="nv.nombres"></ion-input></ion-item>
            <ion-item><ion-input label="Apellidos" labelPlacement="floating" [(ngModel)]="nv.apellidos"></ion-input></ion-item>
            <ion-item><ion-input label="Teléfono (09XXXXXXXX)" labelPlacement="floating" inputmode="tel" [(ngModel)]="nv.telefono"></ion-input></ion-item>
            <ion-item><ion-input label="Correo" labelPlacement="floating" type="email" [(ngModel)]="nv.correo"></ion-input></ion-item>
            <ion-button expand="block" class="ion-margin-top" [disabled]="guardando()" (click)="crearVeedor()">Crear veedor</ion-button>
            <h3 class="ion-margin-top">Veedores del recinto</h3>
            <ion-list>
              @for (v of veedores(); track v.id) {
                <ion-item><ion-label><h2>{{ v.nombres }} {{ v.apellidos }}</h2><p>{{ v.cedula }} · {{ v.correo }} · {{ nMesas(v.id) }} mesa(s)</p></ion-label></ion-item>
              } @empty { <p>Aún no hay veedores.</p> }
            </ion-list>
          }
        }
      }
    </ion-content>
  `,
})
export class MesasPage implements OnInit {
  private datosSrv = inject(DatosService);
  private srv = inject(UsuariosService);
  private ui = inject(UiService);
  cargos: Cargo[] = ['alcalde', 'prefecto'];
  vista = signal<'mesas' | 'veedores'>('mesas');
  estado = signal<'cargando' | 'ok' | 'error'>('cargando');
  mensaje = signal('');
  datos = signal<Datos | null>(null);
  guardando = signal(false);
  nv = { cedula: '', nombres: '', apellidos: '', telefono: '', correo: '' };
  recinto = computed(() => this.datos()?.recintos[0]);
  veedores = computed(() => this.datos()?.perfiles.filter((p) => p.rol === 'veedor') ?? []);

  ngOnInit() { void this.cargar(); }
  estado_(m: Mesa) { return estadoMesa(m, this.datos()!.actas); }
  color(m: Mesa) { return COLOR_ESTADO[this.estado_(m)]; }
  hayActa(m: Mesa, c: Cargo) { return this.datos()!.actas.some((a) => a.mesa_id === m.id && a.cargo === c); }
  nMesas(id: string) { return this.datos()!.mesas.filter((m) => m.veedor_id === id).length; }

  async cargar() {
    this.estado.set('cargando');
    try { this.datos.set(await this.datosSrv.cargar()); this.estado.set('ok'); }
    catch (e) { this.mensaje.set(e instanceof Error ? e.message : 'Error'); this.estado.set('error'); }
  }

  async asignar(m: Mesa, veedorId: string | null) {
    if (veedorId === m.veedor_id) return;
    try {
      await this.srv.asignarMesa(m.id, veedorId);
      void this.ui.toast(veedorId ? `Mesa ${m.numero} asignada` : `Mesa ${m.numero} sin veedor`, 'success');
      await this.cargar();
    } catch (e) { void this.ui.error(e); await this.cargar(); }
  }

  async crearVeedor() {
    this.guardando.set(true);
    try {
      await this.srv.crearVeedor(this.nv);
      void this.ui.toast(`Veedor creado. Confirmación enviada a ${this.nv.correo}. Clave inicial: Ecuador2026`, 'success');
      this.nv = { cedula: '', nombres: '', apellidos: '', telefono: '', correo: '' };
      await this.cargar();
    } catch (e) { void this.ui.error(e); } finally { this.guardando.set(false); }
  }
}
