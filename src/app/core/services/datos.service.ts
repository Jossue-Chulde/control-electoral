import { Injectable, inject } from '@angular/core';
import { DemoDbService } from '../data/demo-db.service';
import { Acta, ActaEdicion, ActaVoto, Candidatura, Mesa, Organizacion, Parroquia, Recinto } from '../../shared/models/electoral.model';
import { Usuario } from '../../shared/models/usuario.model';

export interface Datos {
  recintos: Recinto[]; mesas: Mesa[]; actas: Acta[]; votos: ActaVoto[]; candidaturas: Candidatura[];
  organizaciones: Organizacion[]; perfiles: Usuario[]; parroquias: Parroquia[]; ediciones: ActaEdicion[];
}

@Injectable({ providedIn: 'root' })
export class DatosService {
  private db = inject(DemoDbService);
  async cargar(): Promise<Datos> {
    const [recintos, mesas, actas, votos, candidaturas, organizaciones, perfiles, parroquias, ediciones] = await Promise.all([
      this.db.listar('recintos'), this.db.listar('mesas'), this.db.listar('actas'), this.db.listar('acta_votos'),
      this.db.listar('candidaturas'), this.db.listar('organizaciones'), this.db.listar('perfiles'),
      this.db.listar('parroquias'), this.db.listar('acta_ediciones'),
    ]);
    return { recintos, mesas, actas, votos, candidaturas, organizaciones, perfiles, parroquias, ediciones };
  }
}
