import { Routes } from '@angular/router';
import { AttributeSetStepsComponent } from './attribute-steps/attribute-steps.component';

export const PRODUCT_ATTRIBUTESET_ROUTES: Routes = [
  {
    path: 'add',
    component: AttributeSetStepsComponent
  },
  {
    path: 'edit/:id',
    component: AttributeSetStepsComponent
  }
];
