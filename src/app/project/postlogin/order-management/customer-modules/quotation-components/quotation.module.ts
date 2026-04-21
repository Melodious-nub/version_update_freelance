import { SharedModule } from 'src/app/shared/shared.module';
import {CUSTOM_ELEMENTS_SCHEMA,NgModule, NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotationRoutingModule } from './quotation-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { QuotationListComponent } from './quotation-list/quotation-list.component';
import { CreateQuotationComponent } from './quotation-steps/create-quotation/create-quotation.component';
import { QuotationStepsComponent } from './quotation-steps/quotation-steps.component';
import { QuotationComponent } from './quotation.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';

@NgModule({
  declarations: [
    QuotationListComponent,
    CreateQuotationComponent,
    QuotationStepsComponent,
    QuotationComponent
  ],
  imports: [
    CommonModule,
    QuotationRoutingModule,
    SharedModule,
    MaterialModule
  ],
  exports: [ QuotationListComponent,
    CreateQuotationComponent,
    QuotationStepsComponent,
    QuotationComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class QuotationModule { }
