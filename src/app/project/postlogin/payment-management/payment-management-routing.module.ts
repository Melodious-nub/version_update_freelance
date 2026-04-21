import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './category/category.component';
import { PaymentManagementComponent } from './payment-management.component';
import { PaymentListComponent } from './payment-list/payment-list.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentListComponent,
  },
  {
    path: 'add',
    component: PaymentManagementComponent,
  },
  {
    path: 'category',
    component: CategoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentManagementRoutingModule {}
