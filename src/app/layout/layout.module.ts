import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutRoutingModule } from './layout-routing.module';
import { SharedModule } from '../shared/shared.module';
@NgModule({
    imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    MatSidenavModule,
    LayoutRoutingModule,
    HeaderComponent, SideBarComponent,
],
    exports: [HeaderComponent, SideBarComponent],
})
export class LayoutModule {}
