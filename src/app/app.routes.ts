import { Routes } from '@angular/router';
import { LandingComponent } from './project/prelogin/landing/landing.component';
import { SocialCallbackComponent } from './project/common/social-callback/social-callback.component';
import { QuickCheckoutOrderComponent } from './project/postlogin/quick-checkout/order/quick-checkout-order.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full',
  },
  {
    path: 'home/quick-checkout/order',
    component: QuickCheckoutOrderComponent,
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./project/postlogin/postlogin.routes').then(
        (m) => m.POSTLOGIN_ROUTES
      ),
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'subscription',
    loadChildren: () =>
      import('./project/prelogin/subscription/subscription.routes').then(
        (m) => m.SUBSCRIPTION_ROUTES
      ),
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./project/prelogin/privacy-policy/privacy-policy.routes').then(
        (m) => m.PRIVACY_POLICY_ROUTES
      ),
  },
  {
    path: 'terms-of-service',
    loadChildren: () =>
      import('./project/prelogin/terms-of-service/terms-of-service.routes').then(
        (m) => m.TERMS_OF_SERVICE_ROUTES
      ),
  },
  {
    path: 'social/callback',
    component: SocialCallbackComponent,
  },
  {
    path: '**',
    loadChildren: () =>
      import('./project/prelogin/prelogin.routes').then(
        (m) => m.PRELOGIN_ROUTES
      ),
    runGuardsAndResolvers: 'always',
  },
];
