import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrderManagementComponent } from './order-management.component';
import { OrderManagementRoutingModule } from './order-management-routing.module';
import { ProductAttributeSetModule } from './product-attributeset/product-attributeset.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NotesModule } from './notes/notes.module';

@NgModule({
  declarations: [
    OrderManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    OrderManagementRoutingModule,
    ProductAttributeSetModule,
    NotesModule
  ],
  exports:[OrderManagementComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class OrderManagementModule { }
