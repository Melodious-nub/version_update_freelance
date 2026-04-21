import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';
import { InventoryoutComponent } from './inventoryout.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { InventoryoutListComponent } from './inventoryout-list/inventoryout-list.component';

import { InventoryoutRoutingModule } from './inventoryout-routing.module';
import { OrderArrivalComponent } from './inventoryout-list/order-arrival/order-arrival.component';
import { AddedToInventoryComponent } from './inventoryout-list/added-to-inventory/added-to-inventory.component';
import { ContainerInComponent } from './inventoryout-list/container-in/container-in.component';
import { OrderWiseCreateInventoryComponent } from './order-wise-create-inventory/order-wise-create-inventory.component';
import { InventoryAssigningModalComponent } from './modals/inventory-assigning-modal/inventory-assigning-modal.component';
import { OrderWiseComponent } from './inventoryout-list/order-arrival/order-wise/order-wise.component';
import { ProductWiseComponent } from './inventoryout-list/order-arrival/product-wise/product-wise.component';
import { ProductWiseCreateInventoryComponent } from './product-wise-create-inventory/product-wise-create-inventory.component';


@NgModule({
  declarations: [
    InventoryoutComponent,
    InventoryoutListComponent,
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
    InventoryoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MaterialModule,
    MatStepperModule,
    ToastrModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
})
export class InventoryoutModule {}
