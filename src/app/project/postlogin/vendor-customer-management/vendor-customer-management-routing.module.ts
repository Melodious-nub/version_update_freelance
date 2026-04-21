import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditVendorComponent } from './vendor-customer-home/vendor-customer-home.component';
import { VendorCustomerManagementComponent } from './vendor-customer-management.component';

const routes: Routes = [
  {
    path: 'add',
    component: AddEditVendorComponent
  },
  {
    path: 'edit/:id',
    component: AddEditVendorComponent
  },
  {
    path: 'list',
    component: VendorCustomerManagementComponent
  },
  {
    path: '',
    redirectTo: 'list'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorManagementRoutingModule { }
