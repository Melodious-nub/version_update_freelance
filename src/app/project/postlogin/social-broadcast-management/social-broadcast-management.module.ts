import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialBroadcastManagementRoutingModule } from './social-broadcast-management-routing.module';
import { SocialBroadcastManagementComponent } from './social-broadcast-management.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SocialBroadcastManagementComponent
  ],
  imports: [
    CommonModule,
    SocialBroadcastManagementRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SocialBroadcastManagementModule { }
