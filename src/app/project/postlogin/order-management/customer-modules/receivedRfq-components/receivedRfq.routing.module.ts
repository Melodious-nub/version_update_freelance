import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceivedRfqStepsComponent } from './receivedRfq-steps/receivedRfq-steps.component';


const routes: Routes = [
  {
    path: 'add',
    component: ReceivedRfqStepsComponent,
  },
  {
    path: 'view/:id',
    component: ReceivedRfqStepsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceivedRfqRoutingModule { }
