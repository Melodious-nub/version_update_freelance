import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillManagementComponent } from './bill-management.component';
import { BillListComponent } from './bill-list/bill-list.component';
import { BillStepsComponent } from './bill-steps/bill-steps.component';

const routes: Routes = [
  {
    path: '',
    component: BillManagementComponent,
    children: [
      { 
        path: '',
        component: BillListComponent,
      },
      {
        path: 'add',
        component: BillStepsComponent,
      },
      {
        path: 'edit/:id',
        component: BillStepsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillManagementRoutingModule {}
