import { Routes } from '@angular/router';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { PaymentManagementComponent } from './payment-management.component';
import { CategoryComponent } from './category/category.component';

export const PAYMENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: PaymentListComponent,
  },
  {
    path: 'add',
    component: PaymentManagementComponent,
  },
  {
    path: 'category',
    component: CategoryComponent,
  },
];
