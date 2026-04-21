import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseorderStepsComponent } from './purchaseorder-steps/purchaseorder-steps.component';


const routes: Routes = [
  {
    path: 'add',
    component: PurchaseorderStepsComponent,
  },
  {
    path: 'edit/:id',
    component: PurchaseorderStepsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseorderRoutingModule { }
