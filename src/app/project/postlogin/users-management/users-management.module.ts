import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersManagementRoutingModule } from './users-management-routing.module';
import { UsersManagementComponent } from './users-management.component';
import { InvitesComponent } from './invites/invites.component';
import { SharedModule } from 'src/app/shared/shared.module';

import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
    imports: [
    CommonModule,
    UsersManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatTabsModule,
    UsersManagementComponent,
    InvitesComponent
]
})
export class UsersManagementModule { }
