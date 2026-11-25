import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, ToastController 
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonSpinner
  ]
})
export class HomePage {
  correo = '';
  clave = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async onSubmit() {
    if (!this.correo || !this.clave) return;

    this.cargando = true;
    try {
      await this.authService.login(this.correo, this.clave);
      
      const user = this.authService.usuarioActual();
      if (user?.debe_cambiar_clave) {
        this.mostrarMensaje('Debes cambiar tu contraseña inicial.');
      } else {
        this.router.navigate(['/tabs/dashboard']); // Aquí fallará porque no existe, es normal
      }
    } catch (error: any) {
      this.mostrarMensaje('Error: ' + (error.message || 'Credenciales incorrectas'));
    } finally {
      this.cargando = false;
    }
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}