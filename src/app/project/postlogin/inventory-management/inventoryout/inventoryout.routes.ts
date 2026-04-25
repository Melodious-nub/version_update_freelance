import { Routes } from '@angular/router';
import { InventoryoutComponent } from './inventoryout.component';
import { InventoryoutListComponent } from './inventoryout-list/inventoryout-list.component';
import { OrderWiseCreateInventoryComponent } from './order-wise-create-inventory/order-wise-create-inventory.component';
import { ProductWiseCreateInventoryComponent } from './product-wise-create-inventory/product-wise-create-inventory.component';

export const INVENTORY_OUT_ROUTES: Routes = [
  {
    path: '',
    component: InventoryoutComponent,
    children: [
      {
        path: '',
        component: InventoryoutListComponent,
      },
      {
        path: 'order-wise-create-inventory/:id',
        component: OrderWiseCreateInventoryComponent,
      },
      {
        path: 'order-wise-update-inventory/:id',
        component: OrderWiseCreateInventoryComponent,
      },
      {
        path: 'product-wise-create-inventory/:id',
        component: ProductWiseCreateInventoryComponent,
      },
    ],
  },
];
