import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { BusinessAccountGuard } from 'src/app/guard/business-account.guard';
import { RoleGuard } from 'src/app/guard/role.guard';
import { PostloginComponent } from './postlogin.component';
import { BusinessAccountComponent } from './business-account/business-account.component';
import { BusinessRegistrationComponent } from './business-account/business-registration/business-registration.component';
import { ChooseBusinessAccountComponent } from './business-account/choose-business-account/choose-business-account.component';
import { QuickCheckoutOrderComponent } from './quick-checkout/order/quick-checkout-order.component';
import { QuickCheckoutComponent } from './quick-checkout/quick-checkout.component';

export const POSTLOGIN_ROUTES: Routes = [
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
          import('./home/home.routes').then((m) => m.HOME_ROUTES),
        canActivate: [RoleGuard],
      },
      {
        path: 'container-management',
        loadChildren: () =>
          import('./container-management/container-management.routes').then(
            (m) => m.CONTAINER_MANAGEMENT_ROUTES
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'users-management',
        loadChildren: () =>
          import('./users-management/users-management.routes').then(
            (m) => m.USERS_MANAGEMENT_ROUTES
          ),
      },
      {
        path: 'inventory-management',
        loadChildren: () =>
          import('./inventory-management/inventory-management.routes').then(
            (m) => m.INVENTORY_MANAGEMENT_ROUTES
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'order-management',
        loadChildren: () =>
          import('./order-management/order-management.routes').then(
            (m) => m.ORDER_MANAGEMENT_ROUTES
          )
      },
      {
        path: 'product-management',
        loadChildren: () =>
          import('./product-management/product-management.routes').then(
            (m) => m.PRODUCT_MANAGEMENT_ROUTES
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'system-config',
        loadChildren: () =>
          import(
            './system-config-management/system-config-management.routes'
          ).then((m) => m.SYSTEM_CONFIG_MANAGEMENT_ROUTES),
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
            './vendor-customer-management/vendor-customer-management.routes'
          ).then((m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES),
      },
      {
        path: 'prospect',
        loadChildren: () =>
          import(
            './vendor-customer-management/vendor-customer-management.routes'
          ).then((m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES),
      },
      {
        path: 'customer',
        loadChildren: () =>
          import(
            './vendor-customer-management/vendor-customer-management.routes'
          ).then((m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES),
      },
      {
        path: 'vendor',
        loadChildren: () =>
          import(
            './vendor-customer-management/vendor-customer-management.routes'
          ).then((m) => m.VENDOR_CUSTOMER_MANAGEMENT_ROUTES),
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
          import('./payment-management/payment-management.routes').then(
            (m) => m.PAYMENT_MANAGEMENT_ROUTES
          ),
        canActivate: [RoleGuard],
      },
      {
        path: 'social-broadcast-management',
        loadChildren: () =>
          import('./social-broadcast-management/social-broadcast-management.routes').then(
            (m) => m.SOCIAL_BROADCAST_MANAGEMENT_ROUTES
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
