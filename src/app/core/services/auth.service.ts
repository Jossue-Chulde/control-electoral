import { Injectable, inject } from '@angular/core';
import { DemoDbService } from '../data/demo-db.service';
import { Usuario } from '../../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private db = inject(DemoDbService);
  readonly usuarioActual = this.db.usuario.asReadonly();

  login(cedula: string, clave: string) { return this.db.login(cedula, clave); }
  logout() { this.db.logout(); }
  cambiarClave(nueva: string) { return this.db.cambiarClave(nueva); }
  recuperar(cedula: string) { return this.db.recuperar(cedula); }

  rutaInicio(u: Usuario): string {
    if (u.debe_cambiar_clave) return '/cambiar-clave';
    return u.rol === 'veedor' ? '/tabs/mis-mesas' : '/tabs/resultados';
  }
}
