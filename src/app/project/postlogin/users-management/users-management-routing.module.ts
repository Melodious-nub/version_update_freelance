import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvitesComponent } from './invites/invites.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users'
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./users/users.module').then((m) => m.UsersModule)
  },
  {
    path: 'leads',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.module').then(
        (m) => m.VendorCustomerManagementModule
      )
  },
  {
    path: 'invites',
    component: InvitesComponent
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.module').then(
        (m) => m.VendorCustomerManagementModule
      )
  },
  {
    path: 'prospects',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.module').then(
        (m) => m.VendorCustomerManagementModule
      )
  },
  {
    path: 'vendor',
    loadChildren: () =>
      import('../vendor-customer-management/vendor-customer-management.module').then(
        (m) => m.VendorCustomerManagementModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersManagementRoutingModule {}
