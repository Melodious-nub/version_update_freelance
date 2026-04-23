import { Routes } from '@angular/router';
import { ReceivedQuotationStepsComponent } from './receivedquotation-steps/receivedquotation-steps.component';

export const RECEIVED_QUOTATION_ROUTES: Routes = [ 
  {
    path: 'view/:id',
    component: ReceivedQuotationStepsComponent
  }
];
