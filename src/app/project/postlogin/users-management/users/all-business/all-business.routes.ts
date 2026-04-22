import { Routes } from '@angular/router';
import { AllBusinessComponent } from './all-business.component';
import { AllBusinessListComponent } from './all-business-list/all-business-list.component';

export const ALL_BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: AllBusinessComponent,
    children: [
      {
        path: '',
        component: AllBusinessListComponent,
      },
    ],
  },
];
