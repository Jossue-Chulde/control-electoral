export function validarCedula(c: string): boolean {
  if (!/^\d{10}$/.test(c)) return false;
  const prov = +c.slice(0, 2);
  if (prov < 1 || prov > 24 || +c[2] > 5) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) {
    let v = +c[i] * (i % 2 === 0 ? 2 : 1);
    if (v > 9) v -= 9;
    s += v;
  }
  return (10 - (s % 10)) % 10 === +c[9];
}

export function completarCedula(base9: string): string {
  let s = 0;
  for (let i = 0; i < 9; i++) {
    let v = +base9[i] * (i % 2 === 0 ? 2 : 1);
    if (v > 9) v -= 9;
    s += v;
  }
  return base9 + ((10 - (s % 10)) % 10);
}

export interface NuevoUsuario { cedula: string; nombres: string; apellidos: string; telefono: string; correo: string; }

export function validarNuevoUsuario(u: NuevoUsuario): string | null {
  if (!validarCedula(u.cedula.trim())) return 'Cédula ecuatoriana inválida';
  if (!u.nombres.trim() || !u.apellidos.trim()) return 'Nombres y apellidos son obligatorios';
  if (!/^09\d{8}$/.test(u.telefono.trim())) return 'Teléfono inválido (formato 09XXXXXXXX)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(u.correo.trim())) return 'Correo electrónico inválido';
  return null;
}

export function validarClave(c: string, inicial: string): string | null {
  if (c.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/\d/.test(c) || !/[a-zA-Z]/.test(c)) return 'Debe combinar letras y números';
  if (c === inicial) return 'No puede ser igual a la contraseña inicial';
  return null;
}
