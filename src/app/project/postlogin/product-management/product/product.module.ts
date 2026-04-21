import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProductListComponent } from './product-list/product-list.component';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductComponent } from './product.component';
import { ProductRoutingModule } from './product-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SocialPostsModule } from 'src/app/project/postlogin/social-broadcast-management/social-posts/social-posts.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatStepperModule } from '@angular/material/stepper';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProductListAllComponent } from './product-list-all/product-list-all.component';
import { AddPackageComponent } from './add-package/add-package.component';
import { ToastrModule } from 'ngx-toastr';
import { TemplateViewComponent } from './template-view/template-view.component';
import { RelatedPoComponent } from './related-po/related-po.component';
import { OtherDetailsComponent } from './other-details/other-details.component';
import { QuickPricingModalComponent } from './modals/attribute-value-modal/quick-pricing-modal.component';
import { FilterBoxComponent } from './product-list-all/filter-box/filter-box.component';
import { CustomerDialogComponent } from './modals/customer-dialog/customer-dialog.component';
import { ProductionComponent } from './production/production.component';

@NgModule({
  declarations: [ProductComponent, ProductListComponent, AddProductComponent, ProductListAllComponent, AddPackageComponent, TemplateViewComponent, RelatedPoComponent, OtherDetailsComponent, QuickPricingModalComponent, FilterBoxComponent,CustomerDialogComponent,ProductionComponent],
  imports: [
    CommonModule,
    ProductRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    SocialPostsModule,
    MatStepperModule,
    MatPaginatorModule,
    ToastrModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  providers: [
    DatePipe
  ]
})
export class ProductModule { }
