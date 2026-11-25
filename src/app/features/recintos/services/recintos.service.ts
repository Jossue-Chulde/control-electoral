import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RecintosService {
  constructor(private supabaseService: SupabaseService) {}

  // Obtener la lista de recintos con el nombre de su parroquia
  async obtenerRecintos() {
    const { data, error } = await this.supabaseService.client
      .from('recintos')
      .select(`
        id, 
        nombre, 
        cantidad_jrv,
        parroquias ( nombre )
      `)
      .order('id');

    if (error) throw error;
    return data;
  }
}