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
          import('./signin/signin.routes').then((m) => m.SIGNIN_ROUTES),
      },
      {
        path: 'signup',
        loadChildren: () =>
          import('./signup/signup.routes').then((m) => m.SIGNUP_ROUTES),
      },
      {
        path: 'forgotpassword',
        loadChildren: () =>
          import('./forgotpassword/forgotpassword.routes').then(
            (m) => m.FORGOTPASSWORD_ROUTES
          ),
      },
      {
        path: 'resetpassword',
        loadChildren: () =>
          import('./resetpassword/resetpassword.routes').then(
            (m) => m.RESETPASSWORD_ROUTES
          ),
      },
      {
        path: 'about-us',
        loadChildren: () =>
          import('./contact-us/contact-us.routes').then(
            (m) => m.CONTACTUS_ROUTES
          ),
      },
    ],
  },
];
