import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonBadge, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { Datos, DatosService } from '../../core/services/datos.service';
import { UiService } from '../../core/services/ui.service';
import { RecintosService } from './recintos.service';

@Component({
  selector: 'app-recintos',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonInput, IonSelect, IonSelectOption, IonSpinner],
  template: `
    <ion-header><ion-toolbar color="primary"><ion-title>Recintos</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (!form()) { <ion-button expand="block" (click)="abrir(null)">+ Nuevo recinto con coordinador</ion-button> }
      @if (form(); as f) {
        <h3>{{ f.recintoId ? 'Asignar coordinador' : 'Nuevo recinto' }}</h3>
        @if (!f.recintoId) {
          <ion-select label="Parroquia" labelPlacement="floating" interface="popover" [(ngModel)]="f.parroquia_id">
            @for (p of datos()?.parroquias ?? []; track p.id) { <ion-select-option [value]="p.id">{{ p.nombre }}</ion-select-option> }
          </ion-select>
          <ion-item><ion-input label="Nombre del recinto" labelPlacement="floating" [(ngModel)]="f.nombre"></ion-input></ion-item>
          <ion-item><ion-input label="Cantidad de JRV (1 a 30)" labelPlacement="floating" type="number" [(ngModel)]="f.cantidad_jrv"></ion-input></ion-item>
        }
        <p><strong>Coordinador del recinto</strong></p>
        <ion-item><ion-input label="Cédula" labelPlacement="floating" inputmode="numeric" maxlength="10" [(ngModel)]="f.cedula"></ion-input></ion-item>
        <ion-item><ion-input label="Nombres" labelPlacement="floating" [(ngModel)]="f.nombres"></ion-input></ion-item>
        <ion-item><ion-input label="Apellidos" labelPlacement="floating" [(ngModel)]="f.apellidos"></ion-input></ion-item>
        <ion-item><ion-input label="Teléfono (09XXXXXXXX)" labelPlacement="floating" inputmode="tel" [(ngModel)]="f.telefono"></ion-input></ion-item>
        <ion-item><ion-input label="Correo" labelPlacement="floating" type="email" [(ngModel)]="f.correo"></ion-input></ion-item>
        <ion-button expand="block" class="ion-margin-top" [disabled]="guardando()" (click)="guardar()">
          @if (guardando()) { <ion-spinner name="dots"></ion-spinner> } @else { Guardar }
        </ion-button>
        <ion-button expand="block" fill="clear" (click)="form.set(null)">Cancelar</ion-button>
      }

      @switch (estado()) {
        @case ('cargando') { <div class="centro"><ion-spinner></ion-spinner><p>Cargando recintos…</p></div> }
        @case ('error') { <div class="centro"><p class="error">{{ mensaje() }}</p><ion-button (click)="cargar()">Reintentar</ion-button></div> }
        @default {
          <ion-list>
            @for (r of datos()!.recintos; track r.id) {
              <ion-item>
                <ion-label>
                  <h2>{{ r.nombre }}</h2>
                  <p>{{ parroquia(r.parroquia_id) }} · Coordinador: {{ coordinador(r.coordinador_id) }}</p>
                </ion-label>
                @if (r.coordinador_id) { <ion-badge slot="end">{{ r.cantidad_jrv }} JRV</ion-badge> }
                @else { <ion-button slot="end" size="small" (click)="abrir(r.id)">Asignar coordinador</ion-button> }
              </ion-item>
            }
          </ion-list>
        }
      }
    </ion-content>
  `,
})
export class RecintosPage implements OnInit {
  private datosSrv = inject(DatosService);
  private srv = inject(RecintosService);
  private ui = inject(UiService);
  estado = signal<'cargando' | 'ok' | 'error'>('cargando');
  mensaje = signal('');
  datos = signal<Datos | null>(null);
  guardando = signal(false);
  form = signal<{ recintoId: number | null; parroquia_id: number | null; nombre: string; cantidad_jrv: number | string; cedula: string; nombres: string; apellidos: string; telefono: string; correo: string } | null>(null);

  ngOnInit() { void this.cargar(); }
  parroquia(id: number) { return this.datos()?.parroquias.find((p) => p.id === id)?.nombre ?? ''; }
  coordinador(id: string | null) { const p = this.datos()?.perfiles.find((x) => x.id === id); return p ? `${p.nombres} ${p.apellidos}` : 'sin asignar'; }
  abrir(recintoId: number | null) {
    this.form.set({ recintoId, parroquia_id: null, nombre: '', cantidad_jrv: 4, cedula: '', nombres: '', apellidos: '', telefono: '', correo: '' });
  }

  async cargar() {
    this.estado.set('cargando');
    try { this.datos.set(await this.datosSrv.cargar()); this.estado.set('ok'); }
    catch (e) { this.mensaje.set(e instanceof Error ? e.message : 'Error'); this.estado.set('error'); }
  }

  async guardar() {
    const f = this.form();
    if (!f) return;
    this.guardando.set(true);
    const coord = { cedula: f.cedula, nombres: f.nombres, apellidos: f.apellidos, telefono: f.telefono, correo: f.correo };
    try {
      if (f.recintoId) await this.srv.asignarCoordinador(f.recintoId, coord);
      else await this.srv.crear({ parroquia_id: Number(f.parroquia_id), nombre: f.nombre, cantidad_jrv: Number(f.cantidad_jrv) }, coord);
      void this.ui.toast(`Guardado. Confirmación de cuenta enviada a ${f.correo}. Clave inicial: Ecuador2026`, 'success');
      this.form.set(null);
      await this.cargar();
    } catch (e) { void this.ui.error(e); } finally { this.guardando.set(false); }
  }
}
