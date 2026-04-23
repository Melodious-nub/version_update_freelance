import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllBusinessComponent } from './all-business.component';
import { AllBusinessRoutingModule } from './all-business-routing.module';
import { AllBusinessListComponent } from './all-business-list/all-business-list.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        AllBusinessRoutingModule,
        MaterialModule,
        SharedModule,
        AllBusinessComponent,
        AllBusinessListComponent
    ],
    exports: [
        AllBusinessComponent,
        AllBusinessListComponent
    ]
})
export class AllBusinessModule { }
