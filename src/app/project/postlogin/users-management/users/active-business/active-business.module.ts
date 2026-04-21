import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveBusinessComponent } from './active-business.component';
import { ActiveBusinessRoutingModule } from './active-business-routing.module';
import { ActiveBusinessListComponent } from './active-business-list/active-business-list.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    ActiveBusinessComponent,
    ActiveBusinessListComponent
  ],
  imports: [
    CommonModule,
    ActiveBusinessRoutingModule,
    MaterialModule,
    SharedModule
  ],
  exports: [
    ActiveBusinessComponent,
    ActiveBusinessListComponent
  ]
})
export class ActiveBusinessModule { }
