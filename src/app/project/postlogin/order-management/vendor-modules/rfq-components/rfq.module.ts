import { SharedModule } from 'src/app/shared/shared.module';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { RfqListComponent } from './rfq-list/rfq-list.component';
import { RfqRoutingModule } from './rfq-routing.module';
import { RfqStepsComponent } from './rfq-steps/rfq-steps.component';
import { CreateRfqComponent } from './rfq-steps/create-rfq/create-rfq.component';
import { RfqComponent } from './rfq.component';


@NgModule({
  declarations: [
    CreateRfqComponent,
    RfqListComponent,
    RfqStepsComponent,
    RfqComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    RfqRoutingModule
  ],
  exports: [CreateRfqComponent,RfqListComponent,RfqStepsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class rfqModule { }
