import { Routes } from '@angular/router';
import { InvoiceManagementComponent } from './invoice-management.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceStepsComponent } from './invoice-steps/invoice-steps.component';

export const INVOICE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: InvoiceManagementComponent,
    children: [
      {
        path: '',
        component: InvoiceListComponent,
      },
      {
        path: 'add',
        component: InvoiceStepsComponent,
      },
      {
        path: 'edit/:id',
        component: InvoiceStepsComponent,
      },
    ],
  },
];
