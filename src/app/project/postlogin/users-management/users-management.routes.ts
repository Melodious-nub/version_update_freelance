import { Routes } from '@angular/router';
import { InvitesComponent } from './invites/invites.component';

export const USERS_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./users/users.routes').then((m) => m.USERS_ROUTES)
  },
  {
    path: 'leads',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.routes').then(
        (m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES
      )
  },
  {
    path: 'invites',
    component: InvitesComponent
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.routes').then(
        (m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES
      )
  },
  {
    path: 'prospects',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.routes').then(
        (m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES
      )
  },
  {
    path: 'vendor',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.routes').then(
        (m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES
      )
  }
];
