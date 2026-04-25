import { Routes } from '@angular/router';
import { InventoryinComponent } from './inventoryin.component';
import { InventoryinListComponent } from './inventoryin-list/inventoryin-list.component';
import { OrderWiseCreateInventoryComponent } from './order-wise-create-inventory/order-wise-create-inventory.component';
import { ProductWiseCreateInventoryComponent } from './product-wise-create-inventory/product-wise-create-inventory.component';

export const INVENTORY_IN_ROUTES: Routes = [
  {
    path: '',
    component: InventoryinComponent,
    children: [
      {
        path: '',
        component: InventoryinListComponent,
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
