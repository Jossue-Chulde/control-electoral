import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToggle, IonToolbar } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ConexionService } from '../../core/services/conexion.service';
import { DemoDbService } from '../../core/data/demo-db.service';
import { UiService } from '../../core/services/ui.service';
import { ActasService } from '../actas/actas.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, IonButton],
  template: `
    <ion-header><ion-toolbar color="primary"><ion-title>Perfil</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (auth.usuarioActual(); as u) {
        <ion-list>
          <ion-item><ion-label><h2>{{ u.nombres }} {{ u.apellidos }}</h2><p>{{ rol(u.rol) }}</p></ion-label></ion-item>
          <ion-item><ion-label><p>Cédula</p>{{ u.cedula }}</ion-label></ion-item>
          <ion-item><ion-label><p>Correo / Teléfono</p>{{ u.correo }} · {{ u.telefono }}</ion-label></ion-item>
          <ion-item>
            <ion-toggle [checked]="con.simulada()" (ionChange)="con.simulada.set($any($event).detail.checked)">Simular sin conexión</ion-toggle>
          </ion-item>
          <ion-item><ion-label>Actas pendientes de sincronizar: <strong>{{ actas.pendientes().length }}</strong></ion-label></ion-item>
        </ion-list>
        <ion-button expand="block" fill="outline" class="ion-margin-top" (click)="actas.sincronizar()">Sincronizar ahora</ion-button>
        @if (u.rol === 'veedor') {
          <ion-button expand="block" fill="outline" color="warning" (click)="probarRls()">Probar acceso a mesa ajena (seguridad)</ion-button>
        }
        <ion-button expand="block" color="medium" fill="outline" (click)="reiniciar()">Restablecer datos de demostración</ion-button>
        <ion-button expand="block" color="danger" (click)="salir()">Cerrar sesión</ion-button>
        <p class="centro"><small>Modo demostración · datos almacenados localmente</small></p>
      }
    </ion-content>
  `,
})
export class PerfilPage {
  auth = inject(AuthService);
  con = inject(ConexionService);
  actas = inject(ActasService);
  private db = inject(DemoDbService);
  private router = inject(Router);
  private ui = inject(UiService);
  private alerts = inject(AlertController);

  rol(r: string) { return r === 'provincial' ? 'Coordinador provincial' : r === 'coordinador' ? 'Coordinador de recinto' : 'Veedor de mesa'; }

  async probarRls() {
    const id = this.db.mesaAjena();
    let msg = 'No hay mesas ajenas para probar.';
    if (id) { try { await this.db.probarAcceso(id); msg = 'ALERTA: se obtuvo acceso (no debería ocurrir)'; } catch (e) { msg = (e as Error).message; } }
    const a = await this.alerts.create({ header: 'Prueba de seguridad', message: `Intento de leer la mesa ${id}: ${msg}`, buttons: ['OK'] });
    await a.present();
  }

  salir() { this.auth.logout(); void this.router.navigateByUrl('/login', { replaceUrl: true }); }
  reiniciar() { this.db.reiniciar(); location.href = '/'; }
}
