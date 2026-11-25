import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonNote, IonSpinner } from '@ionic/angular';
import { RecintosService } from '../services/recintos.service';

@Component({
  selector: 'app-lista-recintos',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonNote, IonSpinner],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Recintos Electorales</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="cargando()" class="ion-text-center ion-margin-top">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando recintos...</p>
      </div>

      <ion-list *ngIf="!cargando()">
        <ion-item *ngFor="let recinto of recintos()">
          <ion-label>
            <h2>{{ recinto.nombre }}</h2>
            <p>Parroquia: {{ recinto.parroquias.nombre }}</p>
          </ion-label>
          <ion-note slot="end" color="primary">
            <strong>{{ recinto.cantidad_jrv }} JRV</strong>
          </ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class ListaRecintosPage implements OnInit {
  recintos = signal<any[]>([]);
  cargando = signal(true);

  constructor(private recintosService: RecintosService) {}

  async ngOnInit() {
    try {
      const data = await this.recintosService.obtenerRecintos();
      this.recintos.set(data);
    } catch (error) {
      console.error('Error cargando recintos:', error);
    } finally {
      this.cargando.set(false);
    }
  }
}