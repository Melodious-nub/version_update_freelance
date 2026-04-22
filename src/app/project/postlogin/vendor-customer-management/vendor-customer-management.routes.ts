import { Routes } from '@angular/router';
import { AddEditVendorComponent } from './vendor-customer-home/vendor-customer-home.component';
import { VendorCustomerManagementComponent } from './vendor-customer-management.component';

export const VENDOR_CUSTOMER_MANAGEMENT_ROUTES: Routes = [
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
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
