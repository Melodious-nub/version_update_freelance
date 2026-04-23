import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContactusComponent } from './contact-us.component';
import { ContactusRoutingModule } from './contact-us-routing.module';

@NgModule({
    imports: [
        CommonModule,
        ContactusRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        ContactusComponent,
    ]
})
export class ContactusModule { }
