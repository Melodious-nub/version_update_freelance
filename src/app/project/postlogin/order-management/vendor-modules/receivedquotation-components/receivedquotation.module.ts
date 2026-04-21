import { SharedModule } from 'src/app/shared/shared.module';
import {
  CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceivedQuotationRoutingModule } from './receivedquotation-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ViewQuotationComponent } from './receivedquotation-steps/view-quotation/view-quotation.component';
import { ReceivedQuotationStepsComponent } from './receivedquotation-steps/receivedquotation-steps.component';
import { ReceivedquotationListComponent } from './receivedquotation-list/receivedquotation-list.component';
import { ReceivedQuotationComponent } from './receivedquotation.component';

@NgModule({
  declarations: [
    ReceivedquotationListComponent,
    ViewQuotationComponent,
    ReceivedQuotationStepsComponent,
    ReceivedQuotationComponent
  ],
  imports: [
    CommonModule,
    ReceivedQuotationRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule
  ],
  exports: [
    ReceivedquotationListComponent,
    ViewQuotationComponent,
    ReceivedQuotationStepsComponent,
    ReceivedQuotationComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ReceivedQuotationModule { }
