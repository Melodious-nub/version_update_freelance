import { Routes } from '@angular/router';
import { ProductTypeComponent } from './product-type.component';
import { ProductTypeListComponent } from './productType/product-type-list/product-type-list.component';
import { AddeditProductTypeComponent } from './productType/addedit-product-type/addedit-product-type.component';
import { AddeditSubtypeComponent } from './subType/addedit-subtype/addedit-subtype.component';

export const PRODUCT_TYPE_ROUTES: Routes = [
  {
    path: '', 
    component: ProductTypeComponent,
    children: [
      {
        path: '',
        component: ProductTypeListComponent,
      },
      {
        path: 'add', component: AddeditProductTypeComponent
      },
      {
        path: 'edit/:id', component: AddeditProductTypeComponent
      },
      {
        path: 'subtype/add', component: AddeditSubtypeComponent
      },
      {
        path: 'subtype/edit/:id', component: AddeditSubtypeComponent
      },
    ]
  },
];
