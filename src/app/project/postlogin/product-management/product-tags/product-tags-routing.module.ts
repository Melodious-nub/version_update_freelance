import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductTagsListComponent } from './product-tags-list/product-tags-list.component';
import { ProductTagsComponent } from './product-tags.component';

const routes: Routes = [
  {
    path: '',
    component: ProductTagsComponent,
    children: [
      {
        path: '',
        component: ProductTagsListComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule { }
