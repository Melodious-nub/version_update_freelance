import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'product-type',
    loadChildren: () =>
      import('./product-type-subtype/product-type.module').then((m) => m.ProductTypeModule)
  },
  {
    path: 'product',
    loadChildren: () =>
      import('./product/product.routes').then(
        (m) => m.PRODUCT_ROUTES
      ),
  },
  {
    path: 'product-template',
    loadChildren: () =>
      import(
        './product-template/product-template.module'
      ).then((m) => m.ProductTemplateModule),
  },
  {
    path: 'product-tags',
    loadChildren: () =>
      import(
        './product-tags/product-tags.routes'
      ).then((m) => m.PRODUCT_TAGS_ROUTES),
  },
  {
    path: '',
    redirectTo: 'product'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductManagementRoutingModule { }
