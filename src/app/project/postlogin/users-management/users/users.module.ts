import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { UsersComponent } from './users.component';
import { ActiveBusinessModule } from './active-business/active-business.module';
import { InactiveBusinessModule } from './inactive-business/inactive-business.module';
import { AllBusinessModule } from './all-business/all-business.module';



@NgModule({
  declarations: [
    UsersComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatTabsModule,
    ActiveBusinessModule,
    InactiveBusinessModule,
    AllBusinessModule,
  ]
})
export class UsersModule { }
