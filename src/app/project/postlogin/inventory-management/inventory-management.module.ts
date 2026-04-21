import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryManagementRoutingModule } from './inventory-management-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { InventoryManagementComponent } from './inventory-management.component';

@NgModule({
  declarations: [
    InventoryManagementComponent,
  ],
  imports: [
    CommonModule,
    InventoryManagementRoutingModule,
    MaterialModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class InventoryManagementModule {}
