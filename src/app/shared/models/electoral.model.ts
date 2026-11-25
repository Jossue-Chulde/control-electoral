export type Cargo = 'alcalde' | 'prefecto';
export interface Parroquia { id: number; canton_id: number; nombre: string; }
export interface Organizacion { id: number; nombre: string; }
export interface Candidatura { id: number; organizacion_id: number; cargo: Cargo; candidato: string; }
export interface Recinto { id: number; parroquia_id: number; nombre: string; cantidad_jrv: number; coordinador_id: string | null; }
export interface Mesa { id: number; recinto_id: number; numero: number; veedor_id: string | null; }
export interface Acta {
  id: number; mesa_id: number; cargo: Cargo; nulos: number; blancos: number; sufragantes: number;
  foto_url: string; gps_lat: number | null; gps_lng: number | null; creada_por: string; creada_en: string;
}
export interface ActaVoto { acta_id: number; candidatura_id: number; votos: number; }
export interface ActaEdicion { id: number; acta_id: number; editada_por: string; editada_en: string; cambios: string; }
export type EstadoMesa = 'Sin asignar' | 'Asignada' | 'Acta parcial' | 'Completa';
export interface ActaEntrada {
  mesa_id: number; cargo: Cargo; votos: Record<number, number>; nulos: number; blancos: number;
  sufragantes: number; foto_url: string; gps_lat: number | null; gps_lng: number | null;
}
