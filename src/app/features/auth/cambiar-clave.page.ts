import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
import { CLAVE_INICIAL } from '../../core/data/demo-db.service';
import { validarClave } from '../../shared/validators/validators';

@Component({
  selector: 'app-cambiar-clave',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonSpinner],
  template: `
    <ion-header><ion-toolbar color="primary"><ion-title>Cambio de contraseña</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <div style="max-width:420px;margin:0 auto">
        <p>Por seguridad debe cambiar su contraseña inicial antes de continuar. Mínimo 8 caracteres, con letras y números.</p>
        <ion-item><ion-input label="Nueva contraseña" labelPlacement="floating" type="password" [(ngModel)]="nueva"></ion-input></ion-item>
        <ion-item><ion-input label="Confirmar contraseña" labelPlacement="floating" type="password" [(ngModel)]="confirmar"></ion-input></ion-item>
        <ion-button expand="block" class="ion-margin-top" [disabled]="cargando()" (click)="guardar()">
          @if (cargando()) { <ion-spinner name="dots"></ion-spinner> } @else { Guardar y continuar }
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class CambiarClavePage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);
  nueva = '';
  confirmar = '';
  cargando = signal(false);

  async guardar() {
    const err = validarClave(this.nueva, CLAVE_INICIAL) ?? (this.nueva !== this.confirmar ? 'Las contraseñas no coinciden' : null);
    if (err) return void this.ui.toast(err, 'warning');
    this.cargando.set(true);
    try {
      await this.auth.cambiarClave(this.nueva);
      void this.ui.toast('Contraseña actualizada', 'success');
      await this.router.navigateByUrl(this.auth.rutaInicio(this.auth.usuarioActual()!), { replaceUrl: true });
    } catch (e) { void this.ui.error(e); } finally { this.cargando.set(false); }
  }
}
