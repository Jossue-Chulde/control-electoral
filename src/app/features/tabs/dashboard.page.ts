import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-content class="ion-padding" style="--background: #1a1a1a; color: white;">
      <div style="text-align: center; margin-top: 50px;">
        <h1>¡Bienvenido, Coordinador!</h1>
        <p>Este es el Dashboard del sistema.</p>
        <p>Aquí veremos las estadísticas y resultados.</p>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent]
})
export class DashboardPage {}