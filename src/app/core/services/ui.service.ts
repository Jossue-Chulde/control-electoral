import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class UiService {
  private t = inject(ToastController);
  async toast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary') {
    const t = await this.t.create({ message, duration: 3200, color, position: 'top' });
    await t.present();
  }
  error(e: unknown) { return this.toast(e instanceof Error ? e.message : 'Error inesperado', 'danger'); }
}
