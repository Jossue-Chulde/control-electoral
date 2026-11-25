import { Routes } from '@angular/router';
import { authGuard, rolGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage) },
  { path: 'cambiar-clave', canActivate: [authGuard], loadComponent: () => import('./features/auth/cambiar-clave.page').then((m) => m.CambiarClavePage) },
  {
    path: 'tabs', canActivate: [authGuard],
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: '', redirectTo: 'resultados', pathMatch: 'full' },
      { path: 'resultados', canActivate: [rolGuard], data: { roles: ['provincial', 'coordinador'] }, loadComponent: () => import('./features/resultados/resultados.page').then((m) => m.ResultadosPage) },
      { path: 'recintos', canActivate: [rolGuard], data: { roles: ['provincial'] }, loadComponent: () => import('./features/recintos/recintos.page').then((m) => m.RecintosPage) },
      { path: 'mesas', canActivate: [rolGuard], data: { roles: ['coordinador'] }, loadComponent: () => import('./features/mesas/mesas.page').then((m) => m.MesasPage) },
      { path: 'mis-mesas', canActivate: [rolGuard], data: { roles: ['veedor'] }, loadComponent: () => import('./features/mesas/mis-mesas.page').then((m) => m.MisMesasPage) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil.page').then((m) => m.PerfilPage) },
    ],
  },
  { path: 'acta/:mesaId/:cargo', canActivate: [authGuard, rolGuard], data: { roles: ['coordinador', 'veedor'] }, loadComponent: () => import('./features/actas/acta.page').then((m) => m.ActaPage) },
  { path: '**', redirectTo: 'login' },
];
