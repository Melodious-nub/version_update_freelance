import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryManagementComponent } from './category-management.component';

const routes: Routes = [
  {
    path: '',
    component: CategoryManagementComponent,
  },
  {
    path: 'product-categories',
    loadChildren: () =>
      import('./product-categories/product-categories.module').then(
        (m) => m.ProductCategoriesModule
      ),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryManagementRoutingModule { }
