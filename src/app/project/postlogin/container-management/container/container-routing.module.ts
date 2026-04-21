import { ContainerComponent } from './container.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContainerListComponent } from './container-list/container-list.component';
import { ContainerStepsComponent } from './container-steps/container-steps.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'import',
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContainerRoutingModule {}
