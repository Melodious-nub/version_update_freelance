import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceManagementRoutingModule } from './invoice-management-routing.module';
import { InvoiceStepsComponent } from './invoice-steps/invoice-steps.component';
import { CreateInvoiceComponent } from './invoice-steps/create-invoice/create-invoice.component';
import { InvoiceManagementComponent } from './invoice-management.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    imports: [
    CommonModule,
    SharedModule,
    InvoiceManagementRoutingModule,
    InvoiceManagementComponent,
    InvoiceListComponent,
    InvoiceStepsComponent,
    CreateInvoiceComponent,
],
    exports: [
        InvoiceManagementComponent,
        InvoiceListComponent,
        InvoiceStepsComponent,
        CreateInvoiceComponent,
    ],
})
export class InvoiceManagementModule {}
