import { Routes } from '@angular/router';
import { ProductListAllComponent } from './product-list-all/product-list-all.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductComponent } from './product.component';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductComponent,
    children: [
      {
        path: '',
        component: ProductListAllComponent,
      },
      {
        path: 'add',
        component: ProductListComponent,
      },
      {
        path: 'edit/:id/:createdBy',
        component: ProductListComponent,
      }
    ],
  },
];
