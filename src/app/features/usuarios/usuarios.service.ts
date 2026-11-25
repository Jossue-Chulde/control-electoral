import { Injectable, inject } from '@angular/core';
import { DemoDbService } from '../../core/data/demo-db.service';
import { NuevoUsuario } from '../../shared/validators/validators';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private db = inject(DemoDbService);
  crearVeedor(v: NuevoUsuario) { return this.db.crearVeedor(v); }
  asignarMesa(mesaId: number, veedorId: string | null) { return this.db.asignarMesa(mesaId, veedorId); }
}
