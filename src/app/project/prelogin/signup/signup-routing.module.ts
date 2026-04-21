import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { BusinessAccountGuard } from 'src/app/guard/business-account.guard';
import { SignupOTPComponent } from './signup-otp/signup-otp.component';
import { SignupComponent } from './signup.component';

const routes: Routes = [
  {
    path: '',
    component: SignupComponent
  },
  {
    path: 'signup-otp',
    component: SignupOTPComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupRoutingModule { }
