import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceivedQuotationStepsComponent } from './receivedquotation-steps/receivedquotation-steps.component';

const routes: Routes = [ 
  {
    path: 'view/:id',
    component:ReceivedQuotationStepsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceivedQuotationRoutingModule {}
