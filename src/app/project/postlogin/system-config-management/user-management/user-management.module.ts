import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsermanagementComponent } from './user-management.component';
import { UsermanagementRoutingModule } from './user-management-routing.module';
import { UserListingComponent } from './user-listing/user-listing.component';
import { UserDetailsComponent } from './user-details/user-details.component';

@NgModule({
  declarations: [
    UsermanagementComponent,
    UserListingComponent,
    UserDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UsermanagementRoutingModule
  ],
  exports:[],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class UsermanagementModule { }
