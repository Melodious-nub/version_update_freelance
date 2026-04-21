import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersManagementRoutingModule } from './users-management-routing.module';
import { UsersManagementComponent } from './users-management.component';
import { InvitesComponent } from './invites/invites.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
  declarations: [
    UsersManagementComponent,
    InvitesComponent
  ],
  imports: [
    CommonModule,
    UsersManagementRoutingModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatTabsModule
  ]
})
export class UsersManagementModule { }
