import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfqStepsComponent } from './rfq-steps/rfq-steps.component';


const routes: Routes = [
  {
    path: 'add',
    component: RfqStepsComponent
  },
  {
    path: 'edit/:id',
    component: RfqStepsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RfqRoutingModule { }
