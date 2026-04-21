import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductManagementRoutingModule } from './product-management-routing.module';
import { ProductTypeComponent } from './product-type-subtype/product-type.component';
import { ProductTypeListComponent } from './product-type-subtype/productType/product-type-list/product-type-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubtypeListComponent } from './product-type-subtype/subType/subtype-list/subtype-list.component';
import { CalculateErrorModalComponent } from './common-modals/calculate-error-modal/calculate-error-modal.component';
import { RawMaterialPriceModalComponent } from './common-modals/raw-material-price-modal/raw-material-price-modal.component';
import { InventoryLedgerModalComponent } from './common-modals/inventory-ledger-modal/inventory-ledger-modal.component';
import { BatchModalComponent } from './common-modals/batch-modal/batch-modal/batch-modal.component';


@NgModule({
  declarations: [
    ProductTypeListComponent,
    SubtypeListComponent,
    ProductTypeComponent,
    CalculateErrorModalComponent,
    RawMaterialPriceModalComponent,
    InventoryLedgerModalComponent,
    BatchModalComponent
  ],
  imports: [
    CommonModule,
    ProductManagementRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ProductManagementModule { }
