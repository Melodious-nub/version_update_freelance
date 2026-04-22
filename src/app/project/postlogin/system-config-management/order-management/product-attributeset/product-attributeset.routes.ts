import { Routes } from '@angular/router';
import { AttributeListComponent } from './attribute-list/attribute-list.component';
import { AttributeSetStepsComponent } from './attribute-steps/attribute-steps.component';

export const PRODUCT_ATTRIBUTE_SET_ROUTES: Routes = [
  {
    path: '',
    component: AttributeListComponent
  },
  {
    path: 'add',
    component: AttributeSetStepsComponent
  },
  {
    path: 'edit/:id',
    component: AttributeSetStepsComponent
  }
];
