import { Routes } from '@angular/router';

export const PRODUCT_MANAGEMENT_ROUTES: Routes = [
  {
    path: 'product-type',
    loadChildren: () => import('./product-type-subtype/product-type.routes').then(m => m.PRODUCT_TYPE_ROUTES)
  },
  {
    path: 'product',
    loadChildren: () => import('./product/product.routes').then(m => m.PRODUCT_ROUTES)
  },
  {
    path: 'product-template',
    loadChildren: () => import('./product-template/product-template.routes').then(m => m.PRODUCT_TEMPLATE_ROUTES)
  },
  {
    path: 'product-tags',
    loadChildren: () => import('./product-tags/product-tags.routes').then(m => m.PRODUCT_TAGS_ROUTES)
  },
  {
    path: '',
    redirectTo: 'product',
    pathMatch: 'full'
  }
];
