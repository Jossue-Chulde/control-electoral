import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonChip, IonContent, IonInput, IonItem, IonSpinner } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
import { CLAVE_INICIAL } from '../../core/data/demo-db.service';
import { completarCedula, validarCedula } from '../../shared/validators/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IonContent, IonItem, IonInput, IonButton, IonSpinner, IonChip],
  template: `
    <ion-content class="ion-padding">
      <div style="max-width:420px;margin:32px auto 0">
        <h1 style="text-align:center">Control Electoral</h1>
        <p style="text-align:center">Escrutinio · Pichincha</p>
        <ion-item>
          <ion-input label="Cédula" labelPlacement="floating" inputmode="numeric" maxlength="10" [(ngModel)]="cedula"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Contraseña" labelPlacement="floating" type="password" [(ngModel)]="clave" (keyup.enter)="entrar()"></ion-input>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" [disabled]="cargando()" (click)="entrar()">
          @if (cargando()) { <ion-spinner name="dots"></ion-spinner> } @else { Ingresar }
        </ion-button>
        <ion-button expand="block" fill="clear" size="small" (click)="recuperar()">Olvidé mi contraseña</ion-button>

        <p class="ion-margin-top" style="text-align:center"><small>Modo demostración · toque un rol para autocompletar</small></p>
        <div style="text-align:center">
          @for (d of demos; track d.rol) { <ion-chip color="primary" (click)="usar(d.cedula)">{{ d.rol }}</ion-chip> }
        </div>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);
  private alerts = inject(AlertController);
  cedula = '';
  clave = '';
  cargando = signal(false);
  demos = [
    { rol: 'Coordinador provincial', cedula: completarCedula('171000001') },
    { rol: 'Coordinador de recinto', cedula: completarCedula('171000002') },
    { rol: 'Veedor de mesa', cedula: completarCedula('171000004') },
  ];

  usar(c: string) { this.cedula = c; this.clave = CLAVE_INICIAL; }

  async entrar() {
    if (!validarCedula(this.cedula.trim())) return void this.ui.toast('Cédula ecuatoriana inválida', 'warning');
    if (!this.clave) return void this.ui.toast('Ingrese su contraseña', 'warning');
    this.cargando.set(true);
    try {
      const u = await this.auth.login(this.cedula, this.clave);
      this.clave = '';
      await this.router.navigateByUrl(this.auth.rutaInicio(u), { replaceUrl: true });
    } catch (e) { void this.ui.error(e); } finally { this.cargando.set(false); }
  }

  async recuperar() {
    const a = await this.alerts.create({
      header: 'Recuperar contraseña', message: 'Ingrese su cédula y le enviaremos un correo.',
      inputs: [{ name: 'cedula', type: 'text', placeholder: 'Cédula', value: this.cedula }],
      buttons: ['Cancelar', { text: 'Enviar', handler: (d) => { void this.enviar(String(d.cedula ?? '')); } }],
    });
    await a.present();
  }

  private async enviar(c: string) {
    if (!validarCedula(c.trim())) return void this.ui.toast('Cédula ecuatoriana inválida', 'warning');
    await this.auth.recuperar(c);
    void this.ui.toast('Si la cédula está registrada, se envió un correo de recuperación (demo: clave restablecida a ' + CLAVE_INICIAL + ').', 'success');
  }
}
