import { Component, EventEmitter, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';
import { UntypedFormArray, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuickCheckoutFormsService } from '../services/quickcheckout-forms.service';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { environment } from 'src/environments/environment';
import { DadyinSliderComponent } from 'src/app/shared/widgets/dadyin-slider/dadyin-slider.component';
import { CustomizeGuidelineDialogComponent } from 'src/app/shared/dialogs/customizeGuideline/customizeGuideline-dialog.component';
import { CommonService } from 'src/app/service/common.service';
import { SortNumberPropertyPipe } from '../../../../shared/pipes/sort-number-property.pipe';
import { NumberFormatterPipe } from '../../../../shared/pipes/number-formatter.pipe';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { NgClass } from '@angular/common';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-qc-product-detail',
    templateUrl: './qc-product-detail.component.html',
    styleUrls: ['./qc-product-detail.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        DadyinButtonComponent,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatIcon,
        FormsModule,
        ReactiveFormsModule,
        MatTooltip,
        NgClass,
        ExtendedModule,
        NumberFormatterPipe,
        SortNumberPropertyPipe
    ]
})
export class QcProductDetailComponent implements OnInit {
  dialogRef = inject<MatDialogRef<QcProductDetailComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  dialog = inject(MatDialog);
  purchaseOrderService = inject(PurchaseOrderService);
  toastr = inject(ToastrService);
  quickCheckoutFormService = inject(QuickCheckoutFormsService);
  apiService = inject(ApiService);
  formsService = inject(FormsService);
  fb = inject(UntypedFormBuilder);
  commonService = inject(CommonService);

  imgUrl = environment.imgUrl;
  productDetail: any;
  productAttributeIds: any;
  customisationOption = false;
  addToOrderEvent = new EventEmitter();
  changeQuantityEvent = new EventEmitter();
  calculateDialogEvent = new EventEmitter();
  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];

  ngOnInit(): void {
    this.getProductDetail();
  }

  trackByFn(index, item) {
    return index;
  }

  getProductDetail() {
    const productId = this.data.productData.value.productDetails?.id;
    this.purchaseOrderService.getProductDetail(productId).subscribe(
      (res) => {
        this.productDetail = res?.content[0];

        if (this.packageCustomAttributeValues?.value.length == 0) {
          // adding default
          const attributeForm = this.formsService.createAttributeForm();
          attributeForm.get('attributeId').setValue(50);
          this.packageCustomAttributeValues.enable();
          this.packageCustomAttributeValues.clear();
          this.packageCustomAttributeValues.push(attributeForm);
          const attributeForm2 = this.formsService.createAttributeForm();
          attributeForm2.get('attributeId').setValue(51);
          this.packageCustomAttributeValues.push(attributeForm2);
          this.productDetail?.productAttributes.forEach((element) => {
            if ([45, 46, 47, 48, 49, 50, 51].includes(element.attributeId)) {
              const packageAttributeForm =
                this.formsService.createPackageAttributeForm();
              packageAttributeForm
                .get('attributeId')
                .patchValue(element.attributeId);
              this.packageCustomAttributeValues.push(packageAttributeForm);
            }
          });
        }
        if (this.data.customisationOption) {
          this.toggleCustomisation();
        }
      },
      (err) => {
        console.log(err, 'errorlog');
      }
    );
  }

  get packageCustomAttributeValues() {
    return this.data.productData.get(
      'packageCustomAttributeValues'
    ) as UntypedFormArray;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  addProductToOrder() {
    if (this.productDetail?.isNoGenericPurchase && !this.customisationOption) {
      this.toastr.warning('No generic purchase available');
      return;
    }
    this.addToOrderEvent.emit({ isCustomizable: this.customisationOption });
    this.dialogRef.close();
    this.packageCustomAttributeValues.clear();
  }

  changeQuantity(event: any) {
    if (this.data?.hideAddToOrder) {
      return;
    }
    const data = {
      event: event,
      changeQuantity: true,
      minus: false,
      plus: false,
      isCustomizable: this.customisationOption,
      productData: this.data.productData.value,
      productForm: this.data.productData,
    };
    this.skuQuantities.patchValue(event.target.value);
    this.changeQuantityEvent.emit(data);
  }

  plus() {
    const qty = this.data.productData.value.skuQuantities + 1;
    this.skuQuantities.patchValue(qty);
    const event = { target: { value: qty } };
    const data = {
      event: event,
      changeQuantity: false,
      minus: false,
      plus: true,
      isCustomizable: this.customisationOption,
      productData: this.data.productData.value,
      productForm: this.data.productData,
    };
    this.changeQuantityEvent.emit(data);
  }

  minus() {
    const qty = this.data.productData.value.skuQuantities - 1;
    this.skuQuantities.patchValue(qty);
    const event = { target: { value: qty } };
    const data = {
      event: event,
      changeQuantity: false,
      minus: true,
      plus: false,
      isCustomizable: this.customisationOption,
      productData: this.data.productData.value,
      productForm: this.data.productData,
    };
    this.changeQuantityEvent.emit(data);
  }

  get unitQuantities() {
    return this.data.productData.get('unitQuantities');
  }

  get skuQuantities() {
    return this.data.productData.get('skuQuantities');
  }
  get quantity() {
    return this.data.productData.get('quantity');
  }

  getAttributeControlById(attributeId) {
    let control = this.packageCustomAttributeValues.controls.find(
      (x) => x.get('attributeId').value == attributeId
    );
    return control;
  }

  getAttributeObjectById(attributeId: any) {
    if (attributeId) {
      let selectedAttribute = this.apiService.allAttributes.find(
        (x) => x['id'] == attributeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }
  getAttributeTypeObjectById(attributeTypeId: any) {
    if (attributeTypeId) {
      let selectedAttribute = this.apiService.allAttributesTypes.find(
        (x) => x['id'] == attributeTypeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }

  onClickNumberOfDays(numberOfDays: any, quantity?: any) {
    if (quantity) {
      this.skuQuantities.patchValue(quantity);
      this.quantity.patchValue(quantity);
    }
    this.orderDelivery.patchValue(numberOfDays);
    this.calculateValues();
  }

  get orderDelivery() {
    return this.data.productData.get('deliveryDays');
  }

  onClickQuantity(quantity: any) {
    this.skuQuantities.patchValue(quantity);
    this.quantity.patchValue(quantity);
    const event = { target: { value: quantity } };
    this.changeQuantity(event);
  }

  toggleCustomisation() {
    if (!this.customisationOption && this.data.isSelfProduct) {
      this.toastr.warning('No customization available for self product');
      return;
    }

    if (this.productDetail?.isNoGenericPurchase && this.customisationOption) {
      this.toastr.warning('No generic purchase available');
      return;
    }
    this.customisationOption = !this.customisationOption;
    if (this.customisationOption) {
      if (!this.data.productData.get('isCustomized').value) {
        this.orderDelivery.patchValue(
          this.productDetail?.tierPricingDetail?.tierPricingCustomization[0]
            ?.deliveryPricing[1]?.numberOfDays ?? null
        );
        this.skuQuantities.patchValue(
          this.productDetail?.tierPricingDetail?.tierPricingCustomization[0]
            ?.minimumQuantity
        );
        this.quantity.patchValue(
          this.productDetail?.tierPricingDetail?.tierPricingCustomization[0]
            ?.minimumQuantity
        );
        const event = {
          target: {
            value:
              this.productDetail?.tierPricingDetail?.tierPricingCustomization[0]
                ?.minimumQuantity,
          },
        };
        this.changeQuantity(event);
      }
    } else {
      this.skuQuantities.patchValue(
        this.data.productData.value.productDetails?.skuThirdMinimumQuantity
      );
      this.quantity.patchValue(
        this.data.productData.value.productDetails?.skuThirdMinimumQuantity
      );
      this.data.productData
        .get('isCustomized')
        .patchValue(this.customisationOption);
      this.calculateValues();
    }
  }

  getArray(str: any) {
    if (!str) {
      return [];
    }
    let prop = JSON.parse(str.replace(/'/g, '"'));
    if (!prop) {
      return [];
    }
    return prop;
  }

  getAttributeById(id: any) {
    const item = this.productDetail.productAttributes.find(
      (attr) => attr.attributeId == id
    );
    return item;
  }
  getAttributeIndexById(id: any) {
    const itemIndex = this.productDetail.productAttributes.findIndex(
      (attr) => attr.attributeId == id
    );
    return itemIndex;
  }

  async uploadFile(imgfile) {
    try {
      const res: any = await this.apiService.uploadFiles(imgfile);
      this.getAttributeControlById(50)
        .get('attributeValue')
        .patchValue(res.data[0]?.media_url);
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  get isNotAvailableInTopList() {
    const productId = this.data.productData.value.productDetails?.id;
    let existingProductIndex =
      this.data.orderForm.value.productPackages.findIndex(
        (itm) => itm.productId == productId
      );
    if (existingProductIndex == -1) {
      return true;
    } else {
      return false;
    }
  }

  imageselected(event: any) {
    this.uploadFile(event.target.files);
  }

  async toggleAttribute(item: any, index) {
    let it = item?.attributeValueExpression;
    let expressionArray = await this.getArray(it);
    expressionArray[index].selected = true;
    if (index == 1) {
      expressionArray[0].selected = false;
    }
    if (index == 0) {
      expressionArray[1].selected = false;
    }
    let expression = JSON.stringify(expressionArray);
    this.getAttributeControlById(49)
      .get('attributeValueExpression')
      .patchValue(expression);
  }

  calculateValues() {
    const data: any = {
      product: this.data.productData.value,
      customizable: this.customisationOption,
    };
    this.calculateDialogEvent.emit(data);
  }

  openImageSlider(images: any, i) {
    this.dialog.open(DadyinSliderComponent, {
      data: { images: images, index: i },
      panelClass: 'slider-dialog',
    });
  }

  openCustomizeGuideline() {
    this.dialog.open(CustomizeGuidelineDialogComponent, {
      panelClass: 'guideline-dialog',
    });
  }
}
