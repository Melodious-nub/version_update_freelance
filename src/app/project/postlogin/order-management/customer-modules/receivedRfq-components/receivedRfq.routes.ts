import { Routes } from '@angular/router';
import { ReceivedRfqStepsComponent } from './receivedRfq-steps/receivedRfq-steps.component';

export const RECEIVED_RFQ_ROUTES: Routes = [
  {
    path: 'add',
    component: ReceivedRfqStepsComponent,
  },
  {
    path: 'view/:id',
    component: ReceivedRfqStepsComponent,
  }
];
