import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { BusinessAccountGuard } from 'src/app/guard/business-account.guard';
import { RoleGuard } from 'src/app/guard/role.guard';
import { PostloginComponent } from './postlogin.component';
import { BusinessAccountComponent } from './business-account/business-account.component';
import { BusinessRegistrationComponent } from './business-account/business-registration/business-registration.component';
import { ChooseBusinessAccountComponent } from './business-account/choose-business-account/choose-business-account.component';
import { QuickCheckoutOrderComponent } from './quick-checkout/order/quick-checkout-order.component';
import { QuickCheckoutComponent } from './quick-checkout/quick-checkout.component';

const routes: Routes = [
  {
    path: '',
    component: PostloginComponent,
    canActivate: [AuthGuard, BusinessAccountGuard],
    canActivateChild: [AuthGuard, BusinessAccountGuard],
    children: [
      {
        path: 'leads',
        redirectTo: 'users-management/leads',
        pathMatch: 'prefix',
      },
      {
        path: '',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
        canActivate: [RoleGuard],
      },
      {
        path: 'container-management',
        loadChildren: () =>
          import('./container-management/container-management.module').then(
            (m) => m.ContainerManagementModule
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'users-management',
        loadChildren: () =>
          import('./users-management/users-management.module').then(
            (m) => m.UsersManagementModule
          ),
        // canActivate: [RoleGuard],
      },
      {
        path: 'inventory-management',
        loadChildren: () =>
          import('./inventory-management/inventory-management.module').then(
            (m) => m.InventoryManagementModule
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'order-management',
        loadChildren: () =>
          import('./order-management/order-management.module').then(
            (m) => m.OrderManagementModule
          )
      },
      {
        path: 'product-management',
        loadChildren: () =>
          import('./product-management/product-management.module').then(
            (m) => m.ProductManagementModule
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'system-config',
        loadChildren: () =>
          import(
            './system-config-management/system-config-management.module'
          ).then((m) => m.SystemConfigModule),
        canActivate: [RoleGuard],
      },
      {
        path: 'business-registration',
        component: BusinessRegistrationComponent,
        canActivate: [RoleGuard],
      },
      {
        path: 'lead',
        loadChildren: () =>
          import(
            './vendor-customer-management/vendor-customer-management.module'
          ).then((m) => m.VendorCustomerManagementModule),
      },
      {
        path: 'prospect',
        loadChildren: () =>
          import(
            './vendor-customer-management/vendor-customer-management.module'
          ).then((m) => m.VendorCustomerManagementModule),
        // canActivate: [RoleGuard],
      },
      {
        path: 'customer',
        loadChildren: () =>
          import(
            './vendor-customer-management/vendor-customer-management.module'
          ).then((m) => m.VendorCustomerManagementModule),
        // canActivate: [RoleGuard],
      },
      {
        path: 'vendor',
        loadChildren: () =>
          import(
            './vendor-customer-management/vendor-customer-management.module'
          ).then((m) => m.VendorCustomerManagementModule),
        canActivate: [RoleGuard],
      },
      {
        path: 'quick-checkout',
        component: QuickCheckoutComponent,
        canActivate: [RoleGuard],
      },
      {
        path: 'quick-checkout/order/:id',
        component: QuickCheckoutOrderComponent,
        canActivate: [RoleGuard],
      },
      {
        path: 'quick-checkout/order',
        component: QuickCheckoutOrderComponent,
        canActivate: [RoleGuard],
      },
      {
        path: 'payment-management',
        loadChildren: () =>
          import('./payment-management/payment-management.module').then(
            (m) => m.PaymentManagementModule
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'social-broadcast-management',
        loadChildren: () =>
          import('./social-broadcast-management/social-broadcast-management.module').then(
            (m) => m.SocialBroadcastManagementModule
          ),
        canActivate: [RoleGuard],
      }
    ],
  },

  {
    path: 'business-details',
    component: BusinessAccountComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'select-business-account',
    component: ChooseBusinessAccountComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostloginRoutingModule {}
