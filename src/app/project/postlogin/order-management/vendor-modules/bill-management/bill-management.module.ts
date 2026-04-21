import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillManagementRoutingModule } from './bill-management-routing.module';
import { BillStepsComponent } from './bill-steps/bill-steps.component';
import { BillManagementComponent } from './bill-management.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { BillListComponent } from './bill-list/bill-list.component';
import { CreateBillComponent } from './bill-steps/create-bill/create-bill.component';
@NgModule({
  declarations: [
    BillManagementComponent,
    BillListComponent,
    BillStepsComponent,
    CreateBillComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    BillManagementRoutingModule,
  ],
  exports: [
    BillManagementComponent,
    BillListComponent,
    BillStepsComponent,
    CreateBillComponent,
  ],
})
export class BillManagementModule {}
