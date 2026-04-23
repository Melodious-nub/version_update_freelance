import { Routes } from '@angular/router';

export const CONTAINER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'container',
    pathMatch: 'full'
  },
  {
    path: 'container',
    loadChildren: () =>
      import('./container/container.routes').then((m) => m.CONTAINER_ROUTES)
  }
];
