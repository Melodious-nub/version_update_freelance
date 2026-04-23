import { Routes } from '@angular/router';
import { CustomerManagementComponent } from './customer-management.component';

export const CUSTOMER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: CustomerManagementComponent,
  },
  {
    path: 'receivedPo',
    loadChildren: () =>
      import('./receivedPo/receivedPo.routes').then((m) => m.RECEIVED_PO_ROUTES),
  },
  {
    path: 'receivedRfq',
    loadChildren: () =>
      import('./receivedRfq-components/receivedRfq.routes').then(
        (m) => m.RECEIVED_RFQ_ROUTES
      ),
  },
  {
    path: 'quotation',
    loadChildren: () =>
      import('./quotation-components/quotation.routes').then(
        (m) => m.QUOTATION_ROUTES
      ),
  },
  {
      path: 'invoice',
      loadChildren: () =>
        import('./invoice-management/invoice-management.routes').then(
          (m) => m.INVOICE_MANAGEMENT_ROUTES
        ),
    },
];
