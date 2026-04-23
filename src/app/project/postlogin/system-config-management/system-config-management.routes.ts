import { Routes } from '@angular/router';
import { SystemConfigManagementComponent } from './system-config-management.component';
import { BusinessEntityConfigurationComponent } from './business-entity-configuration/business-entity-configuration.component';

export const SYSTEM_CONFIG_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: SystemConfigManagementComponent
  },
  {
    path: 'order-management',
    loadChildren: () =>
      import('./order-management/order-management.routes').then(
        (m) => m.ORDER_MANAGEMENT_ROUTES
      ),
  },
  {
    path: 'user-management',
    loadChildren: () =>
      import('./user-management/user-management.routes').then(
        (m) => m.USER_MANAGEMENT_ROUTES
      ),
  },
  {
    path: 'category-management',
    loadChildren: () =>
      import('./category-management/category-management.routes').then(
        (m) => m.CATEGORY_MANAGEMENT_ROUTES
      ),
  },
  {
    path: 'business-entity-configuration',
    component: BusinessEntityConfigurationComponent
  }
];
