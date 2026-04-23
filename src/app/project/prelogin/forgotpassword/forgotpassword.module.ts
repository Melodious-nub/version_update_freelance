import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ForgotPasswordRoutingModule } from './forgotpassword-routing.module';
import { ForgotPasswordComponent } from './forgotpassword.component';

@NgModule({
    imports: [
        CommonModule,
        ForgotPasswordRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        ForgotPasswordComponent,
    ]
})
export class ForgotPasswordModule { }
