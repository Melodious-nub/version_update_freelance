import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerManagementComponent } from './customer-management.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerManagementComponent,
  },
  {
    path: 'receivedPo',
    loadChildren: () =>
      import('./receivedPo/receivedPo.module').then((m) => m.ReceivedPoModule),
  },
  {
    path: 'receivedRfq',
    loadChildren: () =>
      import('./receivedRfq-components/receivedRfq.module').then(
        (m) => m.ReceivedRfqModule
      ),
  },
  {
    path: 'quotation',
    loadChildren: () =>
      import('./quotation-components/quotation.module').then(
        (m) => m.QuotationModule
      ),
  },
  {
      path: 'invoice',
      loadChildren: () =>
        import('./invoice-management/invoice-management.module').then(
          (m) => m.InvoiceManagementModule
        ),
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerManagementRoutingModule {}
