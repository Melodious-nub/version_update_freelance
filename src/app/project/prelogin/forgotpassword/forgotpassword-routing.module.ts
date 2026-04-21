import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { BusinessAccountGuard } from 'src/app/guard/business-account.guard';
import { ForgotPasswordComponent } from './forgotpassword.component';

const routes: Routes = [

  {
    path: '', component: ForgotPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForgotPasswordRoutingModule { }
