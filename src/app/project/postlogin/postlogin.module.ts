import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostloginComponent } from './postlogin.component';
import { LayoutModule } from 'src/app/layout/layout.module';
import { PostloginRoutingModule } from './postlogin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessAccountComponent } from './business-account/business-account.component';
import { ChooseBusinessAccountComponent } from './business-account/choose-business-account/choose-business-account.component';
import { MatStepperModule } from '@angular/material/stepper';
import { BusinessRegistrationComponent } from './business-account/business-registration/business-registration.component';
import { ForbiddenComponent } from '../common/forbidden/forbidden.component';
import { HeaderService } from 'src/app/service/header.service';
import { QuickCheckoutComponent } from './quick-checkout/quick-checkout.component';
import { QuickCheckoutOrderComponent } from './quick-checkout/order/quick-checkout-order.component';
import { QcProductDetailComponent } from './quick-checkout/qc-product-detail/qc-product-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PurchaseorderModule } from './order-management/vendor-modules/purchaseorder/purchaseorder.module';
@NgModule({
  declarations: [
    PostloginComponent,
    ChooseBusinessAccountComponent,
    BusinessAccountComponent,
    ForbiddenComponent,
    BusinessRegistrationComponent,
    QuickCheckoutOrderComponent,
    QuickCheckoutComponent,
    QcProductDetailComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    PostloginRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    DragDropModule,
    MatSidenavModule,
    PurchaseorderModule
  ],
  providers: [HeaderService],
})
export class PostloginModule {}
