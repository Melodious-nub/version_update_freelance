
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderManagementRoutingModule } from './order-management-routing.module';
import { OrderManagementComponent } from './order-management.component';

@NgModule({
  declarations: [
    OrderManagementComponent,

  ],
  imports: [
    CommonModule,
    OrderManagementRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class OrderManagementModule {}
