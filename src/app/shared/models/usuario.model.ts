export interface Usuario {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  rol: 'provincial' | 'coordinador' | 'veedor';
  recinto_id: number | null;
  debe_cambiar_clave: boolean;
}