import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ResetPasswordComponent } from './resetpassword.component';
import { ResetPasswordRoutingModule } from './resetpassword-routing.module';

@NgModule({
    imports: [
        CommonModule,
        ResetPasswordRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        ResetPasswordComponent,
    ]
})
export class ResetPasswordModule { }
