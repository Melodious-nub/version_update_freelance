import { SharedModule } from 'src/app/shared/shared.module';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ProductAttributeSetRoutingModule } from './product-categories-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryStepsComponent } from './category-steps/category-steps.component';
import { CreateCategoryComponent } from './category-steps/create-category/create-category.component';

@NgModule({
  declarations: [
    CategoryListComponent,
    CategoryStepsComponent,
    CreateCategoryComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    ProductAttributeSetRoutingModule,
  ],
  exports: [
    CategoryListComponent,
    CategoryStepsComponent,
    CreateCategoryComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ProductCategoriesModule {}
