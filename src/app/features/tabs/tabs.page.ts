import { Component, computed, inject } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { business, documentText, people, personCircle, statsChart } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        @if (rol() !== 'veedor') {
          <ion-tab-button tab="resultados"><ion-icon name="stats-chart"></ion-icon><ion-label>Resultados</ion-label></ion-tab-button>
        }
        @if (rol() === 'provincial') {
          <ion-tab-button tab="recintos"><ion-icon name="business"></ion-icon><ion-label>Recintos</ion-label></ion-tab-button>
        }
        @if (rol() === 'coordinador') {
          <ion-tab-button tab="mesas"><ion-icon name="people"></ion-icon><ion-label>Mesas</ion-label></ion-tab-button>
        }
        @if (rol() === 'veedor') {
          <ion-tab-button tab="mis-mesas"><ion-icon name="document-text"></ion-icon><ion-label>Mis mesas</ion-label></ion-tab-button>
        }
        <ion-tab-button tab="perfil"><ion-icon name="person-circle"></ion-icon><ion-label>Perfil</ion-label></ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  private auth = inject(AuthService);
  rol = computed(() => this.auth.usuarioActual()?.rol);
  constructor() { addIcons({ business, documentText, people, personCircle, statsChart }); }
}
