import { SharedModule } from 'src/app/shared/shared.module';

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
import { InventoryManagementComponent } from './inventory-management.component';

@NgModule({
    imports: [
    CommonModule,
    InventoryManagementRoutingModule,
    SharedModule,
    InventoryManagementComponent
],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class InventoryManagementModule {}
