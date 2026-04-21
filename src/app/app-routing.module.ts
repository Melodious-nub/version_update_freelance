import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './project/prelogin/landing/landing.component';
import { SocialCallbackComponent } from './project/common/social-callback/social-callback.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import('./project/prelogin/prelogin.module').then(
        (m) => m.PreloginModule
      ),
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./project/postlogin/postlogin.module').then(
        (m) => m.PostloginModule
      ),
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'subscription',
    loadChildren: () =>
      import('../app/project/prelogin/subscription/subscription.module').then(
        (m) => m.SubscriptionModule
      ),
    // canActivate: [RoleGuard],
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

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
