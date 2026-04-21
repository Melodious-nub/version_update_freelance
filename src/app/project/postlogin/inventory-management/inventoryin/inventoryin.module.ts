import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';
import { InventoryinComponent } from './inventoryin.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { InventoryinListComponent } from './inventoryin-list/inventoryin-list.component';

import { InventoryinRoutingModule } from './inventoryin-routing.module';
import { OrderArrivalComponent } from './inventoryin-list/order-arrival/order-arrival.component';
import { AddedToInventoryComponent } from './inventoryin-list/added-to-inventory/added-to-inventory.component';
import { ContainerInComponent } from './inventoryin-list/container-in/container-in.component';
import { OrderWiseCreateInventoryComponent } from './order-wise-create-inventory/order-wise-create-inventory.component';
import { InventoryAssigningModalComponent } from './modals/inventory-assigning-modal/inventory-assigning-modal.component';
import { OrderWiseComponent } from './inventoryin-list/order-arrival/order-wise/order-wise.component';
import { ProductWiseComponent } from './inventoryin-list/order-arrival/product-wise/product-wise.component';
import { ProductWiseCreateInventoryComponent } from './product-wise-create-inventory/product-wise-create-inventory.component';


@NgModule({
  declarations: [
    InventoryinComponent,
    InventoryinListComponent,
    OrderArrivalComponent,
    AddedToInventoryComponent,
    ContainerInComponent,
    OrderWiseCreateInventoryComponent,
    InventoryAssigningModalComponent,
    OrderWiseComponent,
    ProductWiseComponent,
    ProductWiseCreateInventoryComponent,
  ],
  imports: [
    CommonModule,
    InventoryinRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialModule,
    MatStepperModule,
    ToastrModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
})
export class InventoryinModule {}
