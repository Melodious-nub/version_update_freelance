import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloginComponent } from './prelogin.component';
import { LayoutModule } from 'src/app/layout/layout.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LandingComponent } from './landing/landing.component';
import { PreloginRoutingModule } from './prelogin-routing.module';


@NgModule({ 
  declarations: [
    PreloginComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    PreloginRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PreloginModule { }
