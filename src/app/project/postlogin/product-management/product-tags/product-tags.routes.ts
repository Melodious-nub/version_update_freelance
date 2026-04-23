import { Routes } from '@angular/router';
import { ProductTagsListComponent } from './product-tags-list/product-tags-list.component';
import { ProductTagsComponent } from './product-tags.component';

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
