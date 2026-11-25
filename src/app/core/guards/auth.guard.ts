import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../../shared/models/usuario.model';

export const authGuard: CanActivateFn = (_r, state) => {
  const a = inject(AuthService), router = inject(Router), u = a.usuarioActual();
  if (!u) return router.parseUrl('/login');
  if (u.debe_cambiar_clave && !state.url.startsWith('/cambiar-clave')) return router.parseUrl('/cambiar-clave');
  return true;
};

export const rolGuard: CanActivateFn = (route) => {
  const a = inject(AuthService), router = inject(Router), u = a.usuarioActual();
  if (!u) return router.parseUrl('/login');
  const roles = route.data['roles'] as Rol[];
  return roles.includes(u.rol) ? true : router.parseUrl(a.rutaInicio(u));
};
