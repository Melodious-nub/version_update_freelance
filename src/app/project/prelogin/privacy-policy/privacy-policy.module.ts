import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { PrivacyPolicyRoutingModule } from './privacy-policy-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PrivacyPolicyRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        PrivacyPolicyComponent,
    ]
})
export class PrivacyPolicyModule { }
