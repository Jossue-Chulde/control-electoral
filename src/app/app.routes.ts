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
        loadComponent: () => import('./features/tabs/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'recintos',
        loadComponent: () => import('./features/recintos/pages/lista-recintos.page').then((m) => m.ListaRecintosPage),
      }
    ]
  }
];