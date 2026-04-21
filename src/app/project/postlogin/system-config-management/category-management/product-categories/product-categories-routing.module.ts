import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from '../../../payment-management/category/category.component';
import { CategoryStepsComponent } from './category-steps/category-steps.component';


const routes: Routes = [
  {
    path: 'add',
    component: CategoryStepsComponent
  },
  {
    path: 'edit/:id',
    component: CategoryStepsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductAttributeSetRoutingModule { }
