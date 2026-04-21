import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/guard/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'customer'
  },
  {
    path: 'customer', loadChildren: () =>
    import('./customer-modules/customer-management.module').then((m) => m.CustomerManagementModule)
  },
  {
    path: 'vendor', loadChildren: () =>
    import('./vendor-modules/vendor-management.module').then((m) => m.VendorManagementModule),
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderManagementRoutingModule {}
