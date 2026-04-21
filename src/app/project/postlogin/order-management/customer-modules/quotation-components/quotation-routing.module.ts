import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotationStepsComponent } from './quotation-steps/quotation-steps.component';

const routes: Routes = [
  {
    path: 'add',
    component:QuotationStepsComponent
  },
  {
    path: 'edit/:id',
    component:QuotationStepsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationRoutingModule {}
