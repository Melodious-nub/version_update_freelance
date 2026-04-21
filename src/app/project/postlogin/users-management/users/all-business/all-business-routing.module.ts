import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllBusinessComponent } from './all-business.component';

const routes: Routes = [
  {
    path: '',
    component: AllBusinessComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllBusinessRoutingModule {}
