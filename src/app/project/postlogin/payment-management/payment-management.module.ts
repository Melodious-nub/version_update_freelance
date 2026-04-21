import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentManagementRoutingModule } from './payment-management-routing.module';
import { PaymentManagementComponent } from './payment-management.component';
import { CategoryDialogComponent } from './dialogs/category-dialog/category-dialog.component';
import { PaymentOptionDialogComponent } from './dialogs/payment-option-dialog/payment-option-dialog.component';
import { PreviewDocumentDialogComponent } from './dialogs/preview-document-dialog/preview-document-dialog.component';
import { CategoryComponent } from './category/category.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentListComponent } from './payment-list/payment-list.component';

@NgModule({
  declarations: [
    PaymentManagementComponent,
    CategoryComponent,
    CategoryDialogComponent,
    PaymentOptionDialogComponent,
    PreviewDocumentDialogComponent,
    PaymentListComponent,
  ],
  imports: [CommonModule, SharedModule, PaymentManagementRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class PaymentManagementModule {}
