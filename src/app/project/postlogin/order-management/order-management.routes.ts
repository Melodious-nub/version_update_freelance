import { Routes } from '@angular/router';
import { RoleGuard } from 'src/app/guard/role.guard';

export const ORDER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'customer',
    pathMatch: 'full'
  },
  {
    path: 'customer', 
    loadChildren: () =>
      import('./customer-modules/customer-management.routes').then((m) => m.CUSTOMER_MANAGEMENT_ROUTES)
  },
  {
    path: 'vendor', 
    loadChildren: () =>
      import('./vendor-modules/vendor-management.routes').then((m) => m.VENDOR_MANAGEMENT_ROUTES),
    canActivate: [RoleGuard]
  }
];
