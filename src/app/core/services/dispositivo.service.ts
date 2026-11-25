import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export const UMBRAL_NITIDEZ = 40;

@Injectable({ providedIn: 'root' })
export class DispositivoService {
  async tomarFoto(): Promise<string> {
    const raw = Capacitor.isNativePlatform() ? await this.fotoNativa() : await this.fotoWeb();
    return this.comprimir(raw);
  }

  private async fotoNativa(): Promise<string> {
    try {
      const p = await Camera.getPhoto({ quality: 80, width: 1280, resultType: CameraResultType.DataUrl, source: CameraSource.Camera, correctOrientation: true });
      return p.dataUrl!;
    } catch (e) {
      const m = String((e as Error)?.message ?? e);
      if (/cancel/i.test(m)) throw new Error('Captura cancelada');
      if (/denied|permission/i.test(m)) throw new Error('Permiso de cámara denegado. Habilítelo en Ajustes del dispositivo.');
      throw new Error('No se pudo usar la cámara: ' + m);
    }
  }

  private fotoWeb(): Promise<string> {
    return new Promise((res, rej) => {
      const i = document.createElement('input');
      i.type = 'file'; i.accept = 'image/*'; i.setAttribute('capture', 'environment');
      i.onchange = () => {
        const f = i.files?.[0];
        if (!f) return rej(new Error('Captura cancelada'));
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(new Error('No se pudo leer la imagen'));
        r.readAsDataURL(f);
      };
      i.oncancel = () => rej(new Error('Captura cancelada'));
      i.click();
    });
  }

  private img(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Imagen no válida')); i.src = src; });
  }

  private async comprimir(src: string, maxW = 900): Promise<string> {
    const im = await this.img(src);
    const w = Math.min(maxW, im.width), h = Math.round((im.height * w) / im.width);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(im, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.7);
  }

  /** Nitidez = varianza del laplaciano sobre la imagen reducida (mayor = más nítida). */
  async nitidez(src: string): Promise<number> {
    const im = await this.img(src);
    const w = 256, h = Math.max(3, Math.round((im.height * w) / im.width));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d')!; ctx.drawImage(im, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) g[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    let s = 0, s2 = 0, n = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, l = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
      s += l; s2 += l * l; n++;
    }
    const m = s / n;
    return Math.round(s2 / n - m * m);
  }

  async ubicacion(): Promise<{ lat: number; lng: number }> {
    try {
      if (Capacitor.isNativePlatform()) {
        const p = await Geolocation.checkPermissions();
        if (p.location !== 'granted') {
          const r = await Geolocation.requestPermissions();
          if (r.location !== 'granted' && r.coarseLocation !== 'granted') throw new Error('denied');
        }
      }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      const m = String((e as Error)?.message ?? e);
      if (/denied|permission/i.test(m)) throw new Error('Permiso de ubicación denegado. Habilítelo en Ajustes.');
      if (/timeout/i.test(m)) throw new Error('Tiempo agotado al obtener la ubicación. Intente de nuevo.');
      throw new Error('No se pudo obtener la ubicación (¿GPS desactivado?).');
    }
  }
}
