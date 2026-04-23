import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { ToastrModule } from 'ngx-toastr';
import { ContainerComponent } from './container.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { ContainerListComponent } from './container-list/container-list.component';
import { OrderDetailsComponent } from './container-steps/order-details/order-details.component';
import { ContainerStepsComponent } from './container-steps/container-steps.component';
import { ContainerRoutingModule } from './container-routing.module';
import { ContainerInfoComponent } from './container-steps/container-info/container-info.component';
import { UnloadingDetailsComponent } from './container-steps/unloading-details/unloading-details.component';
import { DocumentsDetailsComponent } from './container-steps/documents-details/documents-details.component';
import { ExpensesDetailsComponent } from './container-steps/expenses-details/expenses-details.component';

@NgModule({
    imports: [
        CommonModule,
        ContainerRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        MaterialModule,
        MatStepperModule,
        MatExpansionModule,
        ToastrModule,
        ContainerComponent,
        ContainerListComponent,
        ContainerStepsComponent,
        OrderDetailsComponent,
        ContainerInfoComponent,
        ExpensesDetailsComponent,
        DocumentsDetailsComponent,
        UnloadingDetailsComponent,
    ],
})
export class ContainerModule {}
