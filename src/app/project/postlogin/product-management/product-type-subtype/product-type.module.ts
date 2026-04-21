import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductTypeRoutingModule } from './product-type-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddeditProductTypeComponent } from './productType/addedit-product-type/addedit-product-type.component';

import { AddeditSubtypeComponent } from './subType/addedit-subtype/addedit-subtype.component';
import { BuyingCapacityCommonComponent } from './common/buying-capacity-common/buying-capacity-common.component';
import { AdditionalCostCommonComponent } from './common/additional-cost-common/additional-cost-common.component';


@NgModule({
  declarations: [
    AddeditProductTypeComponent,
    AddeditSubtypeComponent,
    AdditionalCostCommonComponent,
    BuyingCapacityCommonComponent
  ],
  imports: [
    ProductTypeRoutingModule,
    CommonModule,
    SharedModule,
  ],
  exports: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ProductTypeModule { }
