import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveBusinessComponent } from './active-business.component';
import { ActiveBusinessRoutingModule } from './active-business-routing.module';
import { ActiveBusinessListComponent } from './active-business-list/active-business-list.component';

import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
    imports: [
    CommonModule,
    ActiveBusinessRoutingModule,
    SharedModule,
    ActiveBusinessComponent,
    ActiveBusinessListComponent
],
    exports: [
        ActiveBusinessComponent,
        ActiveBusinessListComponent
    ]
})
export class ActiveBusinessModule { }
