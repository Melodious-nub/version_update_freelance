import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import {
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerManagementRoutingModule } from './customer-management-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { CustomerManagementComponent } from './customer-management.component';
import { ReceivedPoModule } from './receivedPo/receivedPo.module';
import { ReceivedRfqModule } from './receivedRfq-components/receivedRfq.module';
import { QuotationModule } from './quotation-components/quotation.module';
import { InvoiceManagementModule } from './invoice-management/invoice-management.module';
import { BillManagementModule } from '../vendor-modules/bill-management/bill-management.module';


@NgModule({
  declarations: [
    CustomerManagementComponent
  ],
  imports: [
    CommonModule,
    CustomerManagementRoutingModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    ReceivedPoModule,
    ReceivedRfqModule,
    QuotationModule,
    InvoiceManagementModule
  ],
  exports:[
    CustomerManagementComponent
  ]
})
export class CustomerManagementModule { }
