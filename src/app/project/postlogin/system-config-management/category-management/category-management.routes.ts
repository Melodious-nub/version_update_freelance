import { Routes } from '@angular/router';
import { CategoryManagementComponent } from './category-management.component';

export const CATEGORY_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: CategoryManagementComponent,
  },
  {
    path: 'product-categories',
    loadChildren: () =>
      import('./product-categories/product-categories.routes').then(
        (m) => m.PRODUCT_CATEGORIES_ROUTES
      ),
  }
];
