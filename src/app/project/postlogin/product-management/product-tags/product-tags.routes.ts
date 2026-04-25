import { Routes } from '@angular/router';
import { ProductTagsComponent } from './product-tags.component';
import { ProductTagsListComponent } from './product-tags-list/product-tags-list.component';

export const PRODUCT_TAGS_ROUTES: Routes = [
  {
    path: '',
    component: ProductTagsComponent,
    children: [
      {
        path: '',
        component: ProductTagsListComponent,
      }
    ],
  },
];
