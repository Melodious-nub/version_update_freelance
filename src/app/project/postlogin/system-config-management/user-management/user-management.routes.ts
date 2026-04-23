import { Routes } from '@angular/router';
import { UsermanagementComponent } from './user-management.component';
import { UserListingComponent } from './user-listing/user-listing.component';
import { UserDetailsComponent } from './user-details/user-details.component';

export const USER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: UsermanagementComponent,
    children: [
      {
        path: '',
        component: UserListingComponent,
      },
      {
        path: 'add',
        component: UserDetailsComponent,
      },
      {
        path: 'edit/:id',
        component: UserDetailsComponent,
      }
    ],
  },
];
