import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductTemplateListFormComponent } from './product-template-list-form/product-template-list-form.component';
import { ProductTemplateListComponent } from './product-template-list/product-template-list.component';
import { ProductTemplateComponent } from './product-template.component';

const routes: Routes = [
  {
    path: '',
    component: ProductTemplateComponent,
    children: [
      {
        path: '',
        component: ProductTemplateListComponent,
      },
      {
        path: 'create',
        component: ProductTemplateListFormComponent,
      },
      {
        path: 'edit/:id',
        component: ProductTemplateListFormComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductTemplateRoutingModule { }
