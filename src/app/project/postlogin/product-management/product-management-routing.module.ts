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
      import('./product/product.module').then(
        (m) => m.ProductModule
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
        './product-tags/product-tags.module'
      ).then((m) => m.ProductTagsModule),
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
