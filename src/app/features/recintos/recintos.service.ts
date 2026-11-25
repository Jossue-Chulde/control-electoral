import { Injectable, inject } from '@angular/core';
import { DemoDbService } from '../../core/data/demo-db.service';
import { NuevoUsuario } from '../../shared/validators/validators';

@Injectable({ providedIn: 'root' })
export class RecintosService {
  private db = inject(DemoDbService);
  crear(r: { parroquia_id: number; nombre: string; cantidad_jrv: number }, coord: NuevoUsuario) { return this.db.crearRecinto(r, coord); }
  asignarCoordinador(recintoId: number, coord: NuevoUsuario) { return this.db.crearCoordinador(recintoId, coord); }
}
