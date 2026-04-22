import { Routes } from '@angular/router';
import { ContainerComponent } from './container.component';
import { ContainerListComponent } from './container-list/container-list.component';
import { ContainerStepsComponent } from './container-steps/container-steps.component';

export const CONTAINER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'import',
    pathMatch: 'full',
  },
  {
    path: 'import',
    component: ContainerComponent,
    children: [
      {
        path: '',
        component: ContainerListComponent,
      },
      {
        path: 'add',
        component: ContainerStepsComponent,
      },
      {
        path: 'edit/:id',
        component: ContainerStepsComponent,
      },
    ],
  },
  {
    path: 'export',
    component: ContainerComponent,
    children: [
      {
        path: '',
        component: ContainerListComponent,
      },
      {
        path: 'add',
        component: ContainerStepsComponent,
      },
      {
        path: 'edit/:id',
        component: ContainerStepsComponent,
      },
    ],
  },
  {
    path: 'quotation',
    component: ContainerComponent,
    children: [
      {
        path: 'add',
        component: ContainerStepsComponent,
      },
      {
        path: 'edit/:id',
        component: ContainerStepsComponent,
      },
    ],
  },
];
