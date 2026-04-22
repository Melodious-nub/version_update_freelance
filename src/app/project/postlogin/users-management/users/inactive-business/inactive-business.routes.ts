import { Routes } from '@angular/router';
import { InactiveBusinessComponent } from './inactive-business.component';
import { InactiveBusinessListComponent } from './inactive-business-list/inactive-business-list.component';

export const INACTIVE_BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: InactiveBusinessComponent,
    children: [
      {
        path: '',
        component: InactiveBusinessListComponent,
      },
    ],
  },
];
