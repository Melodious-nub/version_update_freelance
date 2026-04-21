import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { ReceivedPoListComponent } from './receivedPo-list/receivedPo-list.component';
import { CreateOrderComponent } from './receivedPo-steps/create-order/create-order.component';
import { ReceivedPoStepsComponent } from './receivedPo-steps/receivedPo-steps.component';
import { ReceivedPoComponent } from './receivedPo.component';
import { ReceivedPoRoutingModule } from './receivedPo-routing.module';
import { RecordPaymentDialog } from './shared/record-payment-dialog/record-payment-dialog.component';

@NgModule({
  declarations: [
    ReceivedPoComponent,
    ReceivedPoListComponent,
    ReceivedPoStepsComponent,
    CreateOrderComponent,
    RecordPaymentDialog,
  ],
  imports: [
    CommonModule,
    ReceivedPoRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialModule,
    MatStepperModule,
    ToastrModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  exports: [
    ReceivedPoComponent,
    ReceivedPoListComponent,
    ReceivedPoStepsComponent,
    CreateOrderComponent,
    RecordPaymentDialog,
  ],
})
export class ReceivedPoModule {}
