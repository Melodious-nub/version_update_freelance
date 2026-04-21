import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InactiveBusinessComponent } from './inactive-business.component';

const routes: Routes = [
  {
    path: '',
    component: InactiveBusinessComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InactiveBusinessRoutingModule {}
