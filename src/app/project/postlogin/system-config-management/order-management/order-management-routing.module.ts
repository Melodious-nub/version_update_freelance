import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderManagementComponent } from './order-management.component';

const routes: Routes = [
  {
    path: '',
    component: OrderManagementComponent,
  },
  {
    path: 'product-attributeset',
    loadChildren: () =>
      import('./product-attributeset/product-attributeset.module').then(
        (m) => m.ProductAttributeSetModule
      ),
  },
  {
    path: 'notes',
    loadChildren: () =>
      import('./notes/notes.module').then(
        (m) => m.NotesModule
      ),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderManagementRoutingModule { }
