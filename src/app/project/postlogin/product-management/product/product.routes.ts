import { Routes } from '@angular/router';
import { ProductComponent } from './product.component';
import { ProductListAllComponent } from './product-list-all/product-list-all.component';
import { ProductListComponent } from './product-list/product-list.component';

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
