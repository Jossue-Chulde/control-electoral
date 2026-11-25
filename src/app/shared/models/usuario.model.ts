export type Rol = 'provincial' | 'coordinador' | 'veedor';

export interface Usuario {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  rol: Rol;
  recinto_id: number | null;
  debe_cambiar_clave: boolean;
}
