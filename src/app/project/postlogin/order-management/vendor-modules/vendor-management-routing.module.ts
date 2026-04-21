import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorManagementComponent } from './vendor-management.component';



const routes: Routes = [
  {
    path: '',
    component:VendorManagementComponent
  },
  {
    path: 'purchaseorder',
    loadChildren: () => import('./purchaseorder/purchaseorder.module').then((m) => m.PurchaseorderModule)
  },
  {
    path: 'rfq',
    loadChildren: () => import('./rfq-components/rfq.module').then((m) => m.rfqModule)
  },
  {
    path: 'receivedquotation',
    loadChildren: () => import('./receivedquotation-components/receivedquotation.module').then((m) => m.ReceivedQuotationModule)
  },
    {
    path: 'bill',
    loadChildren: () => import('./bill-management/bill-management.module').then((m) => m.BillManagementModule)
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorManagementRoutingModule {}
