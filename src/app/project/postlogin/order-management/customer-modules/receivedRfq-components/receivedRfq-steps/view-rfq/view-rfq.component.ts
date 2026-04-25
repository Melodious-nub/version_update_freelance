import { Component, EventEmitter, HostListener, Input, OnInit, Output, OnDestroy, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { OrderManagementService } from '../../../../service/order-management.service';
import { OrderFormsService } from '../../../../service/order-forms.service';
import { ApiService } from 'src/app/service/api.service';
import { environment } from 'src/environments/environment';
import { OrderTransactionPackagesComponent } from '../../../../../../../shared/component/order-transaction-packages/order-transaction-packages.component';
import { DadyinSelectComponent } from '../../../../../../../shared/widgets/dadyin-select/dadyin-select.component';

import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinInputComponent } from '../../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-view-rfq',
    templateUrl: './view-rfq.component.html',
    styleUrls: ['./view-rfq.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        DadyinInputComponent,
        DadyinButtonComponent,
        DadyinSelectComponent,
        OrderTransactionPackagesComponent
    ]
})
export class ViewRfqComponent implements OnInit, OnDestroy {
  fb = inject(UntypedFormBuilder);
  ordermanagementService = inject(OrderManagementService);
  orderFormService = inject(OrderFormsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
  uomService = inject(UomService);
  containerService = inject(ContainerManagementService);
  businessAccountService = inject(BusinessAccountService);
  apiService = inject(ApiService);

  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map2 = false;
    this.map1 = false;
    this.map3 = false;
  }

  imgUrl = environment.imgUrl;
  map2 = false;
  map1 = false;
  map3 = false;
  @Input() isSelfRfq: any;
  searchProductCode = new Subject();
  searchProductDescription = new Subject();
  @Input() componentUoms: any;
  @Input() rfqForm: UntypedFormGroup;
  @Output() calculate = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  productsList: any;
  minRequiredDate: any = new Date().toISOString().split('T')[0];

  async ngOnInit() {
    this.ordermanagementService.currentRouteId = this.route.snapshot.params.id;
    this.searchProductDescription
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((res) => {
        const productSearchRequest = { searchString: res };
        this.ordermanagementService
          .Get_ALL_Products_List(productSearchRequest)
          .subscribe((res) => {
            this.productsList = res?.content;
          });
      });
  }

  async patchEditData(editData: any) {
    try {
      if (editData) {
        editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
        editData.expectedByDate =
          editData?.expectedByDate?.slice(0, 10) ?? null;
        editData.requiredByDate =
          editData?.requiredByDate?.slice(0, 10) ?? null;
        editData.date = editData?.date?.slice(0, 10) ?? null;
        const productPackages = this.rfqForm.get(
          'productPackages'
        ) as UntypedFormArray;
        productPackages.clear();

        editData?.productPackages.forEach((element) => {
          const productPackage = this.orderFormService.productPackageForm();
          productPackage.patchValue(element);
          productPackages.push(productPackage);
        });

        const messages = this.rfqForm.get('messages') as UntypedFormArray;

        messages.clear();
        editData?.messages.forEach((element) => {
          const productPackage = this.orderFormService.createMessageForm();
          productPackage.patchValue(element);
          messages.push(productPackage);
        });

        this.rfqForm.patchValue(editData);
      }
    } catch (err) {
      this.toastr.error(err ?? 'Some Error Occurred');
    }
  }

  get productPackages() {
    return this.rfqForm.get('productPackages') as UntypedFormArray;
  }

  get messages() {
    return this.rfqForm.get('messages') as UntypedFormArray;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.open(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target['classList'] &&
      target['classList'].contains(expansionIndicatorClass)
    );
  }

  openMap(type: any) {
    if (type == 1) {
      this.map1 = !this.map1;
    }
    if (type == 2) {
      this.map2 = !this.map2;
    }
    if (type == 3) {
      this.map3 = !this.map3;
    }
  }

  deleteProductPackage(i: any) {
    this.productPackages.removeAt(i);
    this.calculateValues();
  }

  addProductPackage() {
    const productPackageRfqForm = this.orderFormService.productPackageRfqForm();
    this.productPackages.push(productPackageRfqForm);
  }

  get requestToAddress() {
    const item = this.businessAccountService.vendorList.find(
      (item) => item.relationAccountId == this.rfqForm.get('requestToId').value
    );
    return item ? item?.address : '';
  }
  // end

  onChange(event, productPackage: UntypedFormGroup) {
    productPackage.get('productDetails').patchValue(event, {
      emitEvent: false,
      onlySelf: true,
    });
    productPackage.get('productDetails').disable({
      emitEvent: false,
      onlySelf: true,
    });
    this.calculateValues();
  }

  async calculateValues() {
    try {
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        element.get('columnMappings').value.forEach((col) => {
          uomQuery =
            uomQuery +
            `&uomMap[${col}]=${element.get('userConversionUom').value}`;
        });
      });
      uomQuery = encodeURI(uomQuery);
      let data: any = this.rfqForm.getRawValue();
      const res: any = await this.ordermanagementService.Calculate_Rfq_Values(
        data,
        uomQuery
      );
      this.patchEditData(res);
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  toggleType(value: any) {
    this.rfqForm.get('importLocalType').setValue(value);
  }
  get importLocalType() {
    return this.rfqForm.get('importLocalType');
  }
  get requestFromName() {
    return this.rfqForm.get('requestFrom').get('name');
  }
  get requestFromId() {
    return this.rfqForm.get('requestFrom').get('id');
  }
  get requestFromAddress() {
    const itm = this.rfqForm.get('requestFrom').value;
    return itm ? itm?.address : '';
  }
  getProductsList(event: any) {
    let productSearchRequest: any = {};
    if (!this.requestFromId.value) {
      this.requestFromId.setValue(1);
    }
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    productSearchRequest.searchString = event.target.value;
    productSearchRequest.uomQuery = uomQuery;
    productSearchRequest.published = true;
    productSearchRequest.businessAccountId =
      this.businessAccountService.currentBusinessAccountId;

    const debounceSubject = new Subject<any>();
    debounceSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.ordermanagementService
          .Get_ALL_Products_List(productSearchRequest)
          .pipe(debounceTime(500), distinctUntilChanged())
          .subscribe((res) => {
            this.productsList = res?.content;
          });
      });

    debounceSubject.next(event);
  }

  changeQuantityInOrder(i) {
    const productControl = this.productPackages.controls[i];
    const quantityControl = this.productPackages.controls[i].get('quantity');

    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    quantityControl.patchValue(quantityControl.value);
    // if (['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value) && (quantityControl.value < productControl.value.productDetails?.containerMqo)) {
    //   this.toastr.error("Quantity Can't be Less than Container MQO " + productControl.value.productDetails?.containerMqo)
    //   quantityControl.patchValue(productControl.value.productDetails?.containerMqo)
    //   return
    // }
    this.calculateValues();
  }
  updateProductQuantityInOrder(i, quantity) {
    const quantityControl = this.productPackages.controls[i].get('quantity');

    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    quantityControl.patchValue(quantityControl.value + quantity);
    // if (['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value) && (quantityControl.value < this.productPackages.controls[i].value.productDetails?.containerMqo)) {
    //   this.toastr.error("Quantity Can't be Less than Container MQO " + this.productPackages.controls[i].value.productDetails?.containerMqo)
    //   quantityControl.patchValue(this.productPackages.controls[i].value.productDetails?.containerMqo)
    //   return
    // }
    this.calculateValues();
  }

  get buyingType() {
    return this.rfqForm.get('buyingType');
  }
  get incoTermId() {
    return this.rfqForm.get('incoTermId');
  }
  get departurePortId() {
    return this.rfqForm.get('departurePortId');
  }
  get customerId() {
    return this.rfqForm.get('requestFrom').get('id');
  }
  onChangeCustomer() {
    const customer = this.businessAccountService.customerList.find(
      (ve) => ve.relationAccountId == this.customerId.value
    );
    this.incoTermId.setValue(customer?.incoTermId);
    this.departurePortId.setValue(customer?.portId);
    if (customer?.isImportExport) {
      this.importLocalType.setValue('CONTAINER');
      this.buyingType.setValue('CONTAINER_40_FT_HQ');
    }
    if (customer?.fulfillmentLimitInDays) {
      this.rfqForm.get('requiredByDate').setValue(null);
      const currentDate = new Date();
      const futureDate = new Date(
        currentDate.getTime() +
          customer?.fulfillmentLimitInDays * 24 * 60 * 60 * 1000
      );
      this.rfqForm
        .get('requiredByDate')
        .setValue(futureDate.toISOString().split('T')[0]);
      this.minRequiredDate = futureDate.toISOString().split('T')[0];
    }
  }

  get media_url_ids() {
    return this.rfqForm.get('media_url_ids');
  }
  get media_urls() {
    return this.rfqForm.get('media_urls');
  }
  get noteId() {
    return this.rfqForm.get('noteTemplate').get('id');
  }

  getNoteTitle() {
    const item = this.businessAccountService.notesList.find(
      (item) => item.id == this.noteId.value
    );
    return item?.description ?? '';
  }

 
}
