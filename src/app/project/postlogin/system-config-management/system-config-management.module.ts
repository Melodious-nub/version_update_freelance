import { GoogleMapsModule } from '@angular/google-maps';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemConfigRoutingModule} from './system-config-management-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { IndustryTypeComponent } from './industry-type/industry-type.component';
import { SystemConfigManagementComponent } from './system-config-management.component';
import { BusinessEntityConfigurationComponent } from './business-entity-configuration/business-entity-configuration.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { ProductTemplateModule } from '../product-management/product-template/product-template.module';

@NgModule({
  declarations: [
    SystemConfigManagementComponent,
    IndustryTypeComponent,
    BusinessEntityConfigurationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SystemConfigRoutingModule,
    DragDropModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    ProductTemplateModule
  ],
  exports: [
    BusinessEntityConfigurationComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SystemConfigModule { }
