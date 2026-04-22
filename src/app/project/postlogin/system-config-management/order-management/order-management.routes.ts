import { Routes } from '@angular/router';
import { OrderManagementComponent } from './order-management.component';

export const ORDER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: OrderManagementComponent,
  },
  {
    path: 'product-attributeset',
    loadChildren: () => import('./product-attributeset/product-attributeset.routes').then(m => m.PRODUCT_ATTRIBUTE_SET_ROUTES),
  },
  {
    path: 'notes',
    loadChildren: () => import('./notes/notes.routes').then(m => m.NOTES_ROUTES),
  }
];
