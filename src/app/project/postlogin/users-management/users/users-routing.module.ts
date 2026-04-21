import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: 'active-business',
        loadChildren: () =>
          import('./active-business/active-business.module').then((m) => m.ActiveBusinessModule),
      },
      {
        path: 'inactive-business',
        loadChildren: () =>
          import('./inactive-business/inactive-business.module').then(
            (m) => m.InactiveBusinessModule
          ),
      },
      {
        path: 'all-business',
        loadChildren: () =>
          import('./all-business/all-business.module').then(
            (m) => m.AllBusinessModule
          ),
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule { }
