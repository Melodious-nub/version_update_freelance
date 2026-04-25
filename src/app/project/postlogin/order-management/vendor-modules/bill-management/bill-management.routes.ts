import { Routes } from '@angular/router';
import { BillManagementComponent } from './bill-management.component';
import { BillListComponent } from './bill-list/bill-list.component';
import { BillStepsComponent } from './bill-steps/bill-steps.component';

export const BILL_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: BillManagementComponent,
    children: [
      {
        path: '',
        component: BillListComponent,
      },
      {
        path: 'add',
        component: BillStepsComponent,
      },
      {
        path: 'edit/:id',
        component: BillStepsComponent,
      },
    ],
  },
];
