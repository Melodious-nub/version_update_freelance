import { SharedModule } from 'src/app/shared/shared.module';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { AttributeListComponent } from './attribute-list/attribute-list.component';
import { AttributeSetStepsComponent } from './attribute-steps/attribute-steps.component';
import { ProductAttributeSetRoutingModule } from './product-attributeset-routing.module';
import { CreateAttributeComponent } from './attribute-steps/create-attribute/create-attribute.component';



@NgModule({
  declarations: [
    AttributeListComponent,
    AttributeSetStepsComponent,
    CreateAttributeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    ProductAttributeSetRoutingModule
  ],
  exports: [AttributeListComponent, AttributeSetStepsComponent, CreateAttributeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ProductAttributeSetModule { }
