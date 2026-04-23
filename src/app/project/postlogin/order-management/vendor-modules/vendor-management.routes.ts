import { Routes } from '@angular/router';
import { VendorManagementComponent } from './vendor-management.component';

export const VENDOR_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: VendorManagementComponent
  },
  {
    path: 'purchaseorder',
    loadChildren: () => import('./purchaseorder/purchaseorder.routes').then((m) => m.PURCHASE_ORDER_ROUTES)
  },
  {
    path: 'rfq',
    loadChildren: () => import('./rfq-components/rfq.routes').then((m) => m.RFQ_ROUTES)
  },
  {
    path: 'receivedquotation',
    loadChildren: () => import('./receivedquotation-components/receivedquotation.routes').then((m) => m.RECEIVED_QUOTATION_ROUTES)
  },
    {
    path: 'bill',
    loadChildren: () => import('./bill-management/bill-management.routes').then((m) => m.BILL_MANAGEMENT_ROUTES)
  }
];
