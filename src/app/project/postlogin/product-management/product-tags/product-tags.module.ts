import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProductTagsListComponent } from './product-tags-list/product-tags-list.component';
import { ProductTagsComponent } from './product-tags.component';
import { ProductRoutingModule } from './product-tags-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
    imports: [
        CommonModule,
        ProductRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        MatStepperModule,
        ToastrModule,
        ProductTagsComponent, ProductTagsListComponent,
    ],
    providers: [
        DatePipe
    ]
})
export class ProductTagsModule { }
