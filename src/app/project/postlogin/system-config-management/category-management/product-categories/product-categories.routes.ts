import { Routes } from '@angular/router';
import { CategoryStepsComponent } from './category-steps/category-steps.component';

export const PRODUCT_CATEGORIES_ROUTES: Routes = [
  {
    path: 'add',
    component: CategoryStepsComponent
  },
  {
    path: 'edit/:id',
    component: CategoryStepsComponent
  }
];
