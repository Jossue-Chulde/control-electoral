import { Component, effect } from '@angular/core';
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
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, CommonModule]
})
export class TabsPage {
  rolActual: string | undefined;

  constructor(private authService: AuthService) {
    addIcons({ people, documentText, statsChart, personCircle, map });

    // effect() se ejecuta cada vez que el signal 'usuarioActual' cambie
    effect(() => {
      this.rolActual = this.authService.usuarioActual()?.rol;
      console.log('Rol detectado en Tabs:', this.rolActual); // Para depurar
    });
  }
}