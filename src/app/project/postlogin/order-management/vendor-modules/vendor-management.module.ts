import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorManagementRoutingModule } from './vendor-management-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { VendorManagementComponent } from './vendor-management.component';
import { rfqModule } from './rfq-components/rfq.module';
import { ReceivedQuotationModule } from './receivedquotation-components/receivedquotation.module';
import { PurchaseorderModule } from './purchaseorder/purchaseorder.module';
import { BillManagementModule } from './bill-management/bill-management.module';

@NgModule({
  declarations: [VendorManagementComponent],
  imports: [
    CommonModule,
    VendorManagementRoutingModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    PurchaseorderModule,
    rfqModule,
    ReceivedQuotationModule,
    BillManagementModule,
  ],
  exports: [VendorManagementComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class VendorManagementModule { }
