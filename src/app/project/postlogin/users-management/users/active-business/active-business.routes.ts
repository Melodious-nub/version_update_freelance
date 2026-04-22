import { Routes } from '@angular/router';
import { ActiveBusinessComponent } from './active-business.component';
import { ActiveBusinessListComponent } from './active-business-list/active-business-list.component';

export const ACTIVE_BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: ActiveBusinessComponent,
    children: [
      {
        path: '',
        component: ActiveBusinessListComponent,
      },
    ],
  },
];
