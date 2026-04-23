import { Routes } from '@angular/router';
import { PreloginComponent } from './prelogin.component';

export const PRELOGIN_ROUTES: Routes = [
  {
    path: '',
    component: PreloginComponent,
    children: [
      {
        path: 'signin',
        loadChildren: () =>
          import('./signin/signin.module').then((m) => m.SigninModule),
      },
      {
        path: 'signup',
        loadChildren: () =>
          import('./signup/signup.module').then((m) => m.SignupModule),
      },
      {
        path: 'forgotpassword',
        loadChildren: () =>
          import('./forgotpassword/forgotpassword.module').then(
            (m) => m.ForgotPasswordModule
          ),
      },
      {
        path: 'resetpassword',
        loadChildren: () =>
          import('./resetpassword/resetpassword.module').then(
            (m) => m.ResetPasswordModule
          ),
      },
      {
        path: 'about-us',
        loadChildren: () =>
          import('./contact-us/contact-us.module').then(
            (m) => m.ContactusModule
          ),
      },
    ],
  },
];
