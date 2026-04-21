import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/modules/material.module';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutRoutingModule } from './layout-routing.module';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  declarations: [HeaderComponent, SideBarComponent],
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    MatSidenavModule,
    LayoutRoutingModule,
  ],
  exports: [HeaderComponent, SideBarComponent],
})
export class LayoutModule {}
