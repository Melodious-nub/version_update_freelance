import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: 'active-business',
        loadChildren: () => import('./active-business/active-business.routes').then(m => m.ACTIVE_BUSINESS_ROUTES),
      },
      {
        path: 'inactive-business',
        loadChildren: () => import('./inactive-business/inactive-business.routes').then(m => m.INACTIVE_BUSINESS_ROUTES),
      },
      {
        path: 'all-business',
        loadChildren: () => import('./all-business/all-business.routes').then(m => m.ALL_BUSINESS_ROUTES),
      }
    ]
  }
];
