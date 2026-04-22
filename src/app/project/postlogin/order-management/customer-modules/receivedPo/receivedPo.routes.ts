import { Routes } from '@angular/router';
import { ReceivedPoStepsComponent } from './receivedPo-steps/receivedPo-steps.component';

export const RECEIVED_PO_ROUTES: Routes = [
  {
    path: 'add',
    component: ReceivedPoStepsComponent,
  },
  {
    path: 'edit/:id',
    component: ReceivedPoStepsComponent,
  }
];
