import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttributeSetStepsComponent } from './attribute-steps/attribute-steps.component';
import { AttributeListComponent } from './attribute-list/attribute-list.component';


const routes: Routes = [
  {
    path: 'add',
    component: AttributeSetStepsComponent
  },
  {
    path: 'edit/:id',
    component: AttributeSetStepsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductAttributeSetRoutingModule { }
