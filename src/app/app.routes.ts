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
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        // ESTA ES LA LÍNEA MÁGICA: 
        // Si la ruta dashboard no tiene componente aún, 
        // cargamos temporalmente una página en blanco para que no falle.
        loadComponent: () => import('./features/tabs/dashboard.page').then((m) => m.DashboardPage).catch(() => import('./features/auth/home.page').then((m) => m.HomePage)),
      }
    ]
  }
];