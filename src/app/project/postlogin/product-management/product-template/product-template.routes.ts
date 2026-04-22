import { Routes } from '@angular/router';
import { ProductTemplateComponent } from './product-template.component';
import { ProductTemplateListComponent } from './product-template-list/product-template-list.component';
import { ProductTemplateListFormComponent } from './product-template-list-form/product-template-list-form.component';

export const PRODUCT_TEMPLATE_ROUTES: Routes = [
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
