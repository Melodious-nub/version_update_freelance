import { Routes } from '@angular/router';
import { QuotationStepsComponent } from './quotation-steps/quotation-steps.component';

export const QUOTATION_ROUTES: Routes = [
  {
    path: 'add',
    component: QuotationStepsComponent
  },
  {
    path: 'edit/:id',
    component: QuotationStepsComponent
  }
];
