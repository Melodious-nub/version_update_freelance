import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InactiveBusinessComponent } from './inactive-business.component';
import { InactiveBusinessRoutingModule } from './inactive-business-routing.module';
import { InactiveBusinessListComponent } from './inactive-business-list/inactive-business-list.component';



@NgModule({
  declarations: [
    InactiveBusinessComponent,
    InactiveBusinessListComponent
  ],
  imports: [
    CommonModule,
    InactiveBusinessRoutingModule
  ],
  exports: [
    InactiveBusinessComponent,
    InactiveBusinessListComponent
  ]
})
export class InactiveBusinessModule { }
