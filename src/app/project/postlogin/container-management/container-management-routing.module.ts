import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'container'
  },
  {
    path: 'container', loadChildren: () =>
    import('./container/container.module').then((m) => m.ContainerModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContainerManagementRoutingModule {}
