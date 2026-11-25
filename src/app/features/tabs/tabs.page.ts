import { Component } from '@angular/core';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { people, documentText, statsChart, personCircle, map } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, CommonModule
  ]
})
export class TabsPage {
  // Obtenemos el rol del usuario para mostrar sus pestañas correspondientes
  rolActual = this.authService.usuarioActual()?.rol;

  constructor(private authService: AuthService) {
    addIcons({ people, documentText, statsChart, personCircle, map });
  }
}