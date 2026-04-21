import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { CategoryManagementComponent } from './category-management.component';
import { CategoryManagementRoutingModule } from './category-management-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductCategoriesModule } from './product-categories/product-categories.module';

@NgModule({
  declarations: [
    CategoryManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    CategoryManagementRoutingModule,
    ProductCategoriesModule
  ],
  exports:[CategoryManagementComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CategoryManagementModule { }
