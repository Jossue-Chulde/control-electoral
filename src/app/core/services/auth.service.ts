import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../../shared/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal para mantener el estado del usuario en toda la app
  public usuarioActual = signal<Usuario | null>(null);

  constructor(private supabaseService: SupabaseService) {
    this.cargarSesion();
  }

  // Al iniciar la app, verifica si ya hay una sesión activa
  async cargarSesion() {
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    if (session) {
      await this.obtenerPerfil(session.user.id);
    }
  }

  // Login con correo y contraseña
  async login(correo: string, clave: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email: correo,
      password: clave
    });

    if (error) throw error;
    
    if (data.user) {
      await this.obtenerPerfil(data.user.id);
    }
    return data;
  }

  // Obtener los datos del perfil desde la tabla 'perfiles'
  private async obtenerPerfil(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al obtener perfil:', error);
      return;
    }

    this.usuarioActual.set(data as Usuario);
  }

  // Cerrar sesión
  async logout() {
    await this.supabaseService.client.auth.signOut();
    this.usuarioActual.set(null);
  }
}