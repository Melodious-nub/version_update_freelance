import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddeditProductTypeComponent } from './productType/addedit-product-type/addedit-product-type.component';
import { AddeditSubtypeComponent } from './subType/addedit-subtype/addedit-subtype.component';
import { ProductTypeListComponent } from './productType/product-type-list/product-type-list.component';
import { ProductTypeComponent } from './product-type.component';
const routes: Routes = [
  {
    path: '', component: ProductTypeComponent,
    children: [
      {
        path: '',
        component: ProductTypeListComponent,
      },
      {
        path: 'add', component: AddeditProductTypeComponent
      },
      {
        path: 'edit/:id', component: AddeditProductTypeComponent
      },
      {
        path: 'subtype/add', component: AddeditSubtypeComponent
      },
      {
        path: 'subtype/edit/:id', component: AddeditSubtypeComponent
      },
      
    
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductTypeRoutingModule { }
