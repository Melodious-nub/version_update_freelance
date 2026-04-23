import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TermsOfServiceComponent } from './terms-of-service.component';
import { TermsOfServiceRoutingModule } from './terms-of-service-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TermsOfServiceRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        TermsOfServiceComponent,
    ]
})
export class TermsOfServiceModule { }
