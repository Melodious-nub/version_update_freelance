import { Routes } from '@angular/router';
import { LandingComponent } from './project/prelogin/landing/landing.component';
import { SocialCallbackComponent } from './project/common/social-callback/social-callback.component';
import { PreloadAllModules } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import('./project/prelogin/prelogin.routes').then(
        (m) => m.PRELOGIN_ROUTES
      ),
    runGuardsAndResolvers: 'always',
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
      import('./project/prelogin/subscription/subscription.module').then(
        (m) => m.SubscriptionModule
      ),
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./project/prelogin/privacy-policy/privacy-policy.module').then(
        (m) => m.PrivacyPolicyModule
      ),
  },
  {
    path: 'terms-of-service',
    loadChildren: () =>
      import('./project/prelogin/terms-of-service/terms-of-service.module').then(
        (m) => m.TermsOfServiceModule
      ),
  },
  {
    path: 'social/callback',
    component: SocialCallbackComponent,
  },
];
