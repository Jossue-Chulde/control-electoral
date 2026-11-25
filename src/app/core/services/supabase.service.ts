import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Exponemos el cliente para usarlo en otros servicios
  get client(): SupabaseClient {
    return this.supabase;
  }

  // Método rápido para ver si hay un usuario logueado
  async getUsuarioActual() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
}