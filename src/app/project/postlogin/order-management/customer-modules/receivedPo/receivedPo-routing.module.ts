import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceivedPoStepsComponent } from './receivedPo-steps/receivedPo-steps.component';


const routes: Routes = [
  {
    path: 'add',
    component: ReceivedPoStepsComponent,
  },
  {
    path: 'edit/:id',
    component: ReceivedPoStepsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceivedPoRoutingModule { }
