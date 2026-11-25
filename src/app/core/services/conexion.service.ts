import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConexionService {
  readonly online = signal(navigator.onLine);
  /** Permite demostrar el modo sin conexión sin apagar la red. */
  readonly simulada = signal(false);
  readonly activo = computed(() => this.online() && !this.simulada());
  constructor() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));
  }
}
