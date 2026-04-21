import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsermanagementComponent } from './user-management.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserListingComponent } from './user-listing/user-listing.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsermanagementRoutingModule { }
