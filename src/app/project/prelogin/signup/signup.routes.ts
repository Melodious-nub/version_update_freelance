import { Routes } from '@angular/router';
import { SignupComponent } from './signup.component';
import { SignupOTPComponent } from './signup-otp/signup-otp.component';

export const SIGNUP_ROUTES: Routes = [
  {
    path: '',
    component: SignupComponent
  },
  {
    path: 'signup-otp',
    component: SignupOTPComponent
  },
];
