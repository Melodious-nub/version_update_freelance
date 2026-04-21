import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { PurchaseorderListComponent } from './purchaseorder-list/purchaseorder-list.component';
import { CreateOrderComponent } from './purchaseorder-steps/create-order/create-order.component';
import { PurchaseorderStepsComponent } from './purchaseorder-steps/purchaseorder-steps.component';
import { PurchaseorderComponent } from './purchaseorder.component';
import { PurchaseorderRoutingModule } from './purchaseorder-routing.module';
import { PaymentComponent } from './purchaseorder-steps/payment/payment.component';

@NgModule({
  declarations: [
    PurchaseorderComponent,
    PurchaseorderListComponent,
    PurchaseorderStepsComponent,
    CreateOrderComponent,
    PaymentComponent,
  ],
  imports: [
    CommonModule,
    PurchaseorderRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialModule,
    MatStepperModule,
    ToastrModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  exports: [
    PurchaseorderComponent,
    PurchaseorderListComponent,
    PurchaseorderStepsComponent,
    CreateOrderComponent,
    PaymentComponent,
  ],
})
export class PurchaseorderModule {}
