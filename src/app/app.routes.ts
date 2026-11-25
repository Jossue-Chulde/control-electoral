import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/home.page').then((m) => m.HomePage),
  },
  // Aquí agregaremos las rutas de Tabs más adelante
];