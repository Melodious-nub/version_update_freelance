import { Routes } from '@angular/router';
import { RfqStepsComponent } from './rfq-steps/rfq-steps.component';

export const RFQ_ROUTES: Routes = [
  {
    path: 'add',
    component: RfqStepsComponent
  },
  {
    path: 'edit/:id',
    component: RfqStepsComponent
  }
];
