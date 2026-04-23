import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';

import { ReceivedPoListComponent } from './receivedPo-list/receivedPo-list.component';
import { CreateOrderComponent } from './receivedPo-steps/create-order/create-order.component';
import { ReceivedPoStepsComponent } from './receivedPo-steps/receivedPo-steps.component';
import { ReceivedPoComponent } from './receivedPo.component';
import { ReceivedPoRoutingModule } from './receivedPo-routing.module';
import { RecordPaymentDialog } from './shared/record-payment-dialog/record-payment-dialog.component';

@NgModule({
    imports: [
    CommonModule,
    ReceivedPoRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MatStepperModule,
    ToastrModule,
    ReceivedPoComponent,
    ReceivedPoListComponent,
    ReceivedPoStepsComponent,
    CreateOrderComponent,
    RecordPaymentDialog,
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
