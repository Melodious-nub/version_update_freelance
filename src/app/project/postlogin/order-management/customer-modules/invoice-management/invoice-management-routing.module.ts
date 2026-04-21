import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceManagementComponent } from './invoice-management.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceStepsComponent } from './invoice-steps/invoice-steps.component';

const routes: Routes = [
  {
    path: '',
    component: InvoiceManagementComponent,
    children: [
      { 
        path: '',
        component: InvoiceListComponent,
      },
      {
        path: 'add',
        component: InvoiceStepsComponent,
      },
      {
        path: 'edit/:id',
        component: InvoiceStepsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceManagementRoutingModule {}
