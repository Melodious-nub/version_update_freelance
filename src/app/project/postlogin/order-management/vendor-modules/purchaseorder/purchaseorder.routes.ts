import { Routes } from '@angular/router';
import { PurchaseorderStepsComponent } from './purchaseorder-steps/purchaseorder-steps.component';

export const PURCHASE_ORDER_ROUTES: Routes = [
  {
    path: 'add',
    component: PurchaseorderStepsComponent,
  },
  {
    path: 'edit/:id',
    component: PurchaseorderStepsComponent,
  }
];
