import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemConfigManagementComponent } from './system-config-management.component';
import { BusinessEntityConfigurationComponent } from './business-entity-configuration/business-entity-configuration.component';

const routes: Routes = [
  {
    path: '',
    component: SystemConfigManagementComponent
  },
  {
    path: 'order-management',
    loadChildren: () =>
      import('./order-management/order-management.module').then(
        (m) => m.OrderManagementModule
      ),
  },
  {
    path: 'user-management',
    loadChildren: () =>
      import('./user-management/user-management.module').then(
        (m) => m.UsermanagementModule
      ),
  },
  {
    path: 'category-management',
    loadChildren: () =>
      import('./category-management/category-management.module').then(
        (m) => m.CategoryManagementModule
      ),
  },
  {
    path: 'business-entity-configuration',
    component: BusinessEntityConfigurationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemConfigRoutingModule { }
