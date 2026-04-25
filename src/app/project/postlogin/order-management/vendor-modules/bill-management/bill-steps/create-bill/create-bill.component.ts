import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, HostListener, OnDestroy, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { ProductService } from 'src/app/project/postlogin/product-management/product/service/product.service';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { PrintService } from 'src/app/service/print.service';
import { MatDialog } from '@angular/material/dialog';
import { BillFormsService } from '../../bill-forms.service';
import { BillManagementService } from '../../bill-management.service';
import { OrderManagementService } from '../../../../service/order-management.service';
import { PricecompareDialogComponent } from 'src/app/shared/component/pricecompare-dialog/pricecompare-dialog.component';
import { OrderTransactionPackagesComponent } from '../../../../../../../shared/component/order-transaction-packages/order-transaction-packages.component';
import { DadyinInputComponent } from '../../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { DadyinSelectComponent } from '../../../../../../../shared/widgets/dadyin-select/dadyin-select.component';

import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchableSelectComponent } from '../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-create-bill',
    templateUrl: './create-bill.component.html',
    styleUrls: ['./create-bill.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        DadyinSearchableSelectComponent,
        DadyinButtonComponent,
        DadyinSelectComponent,
        DadyinInputComponent,
        OrderTransactionPackagesComponent
    ]
})
export class CreateBillComponent implements OnInit, OnDestroy {
  fb = inject(UntypedFormBuilder);
  billManagementService = inject(BillManagementService);
  orderManagementService = inject(OrderManagementService);
  billFormsService = inject(BillFormsService);
  formsService = inject(FormsService);
  route = inject(ActivatedRoute);
  toastr = inject(ToastrService);
  uomService = inject(UomService);
  containerService = inject(ContainerManagementService);
  businessAccountService = inject(BusinessAccountService);
  apiService = inject(ApiService);
  router = inject(Router);
  productService = inject(ProductService);
  ref = inject(ChangeDetectorRef);
  printService = inject(PrintService);
  dialog = inject(MatDialog);

  currentBusinessAccount: any;
  htmlContent: any;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map1 = false;
  }

  map1 = false;
  @Input() componentUoms: any;
  productsList: any;
  quotationsList: any;
  @Input() billForm: UntypedFormGroup;
  @Output() calculate = new EventEmitter();
  @Output() patchEditData = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];
  uomSetting = false;
  minRequiredDate: any = new Date().toISOString().split('T')[0];
  productAttributeSets: any;
  productAttributeSetControl = this.fb.group({
    descriptionId: [null],
  });

  billFile = null;

  ngOnInit() {
    this.businessAccountService.Get_All_Notes();
    this.businessAccountService.Get_All_Vendors();
    this.businessAccountService.Get_All_CustomersList();
    this.businessAccountService.Get_All_Exporter_Vendors();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_paymentTerms();
    this.containerService.Get_All_employees();
    this.containerService.Get_All_Container_List(0, 100, 'asc', null);
    this.setDatas();

    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });

    if (this.route.snapshot.queryParams?.vendorId) {
      this.vendorId.patchValue(
        Number(this.route.snapshot.queryParams?.vendorId)
      );
    }
  }

  setDatas() {
    const currentDate = new Date();
    const expectedByDate = new Date(
      currentDate.getTime() + 45 * 24 * 60 * 60 * 1000
    );
    const editTillDate = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    this.billForm.get('date').setValue(currentDate.toISOString().split('T')[0]);
    this.billForm
      .get('expectedByDate')
      .setValue(expectedByDate.toISOString().split('T')[0]);
    this.billForm
      .get('editTillDate')
      .setValue(editTillDate.toISOString().split('T')[0]);
    this.billForm.get('loadingTypeId').setValue('FLOOR');
  }

  get productPackages() {
    return this.billForm.get('productPackages') as UntypedFormArray;
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
  }

  get requestFromAddress() {
    const itm = this.billForm.get('requestFrom').value;
    return itm ? itm?.address : '';
  }

  get requestToAddress() {
    const id = this.billForm.get('requestTo').value.id;
    const item = this.businessAccountService.vendorList.find(
      (vendor) => vendor.relationAccountId == Number(id)
    );
    return item?.address?.addressLine ?? '';
  }

  getProductsList(
    event: any,
    productCategoryId?: any,
    favourite: boolean = false
  ) {
    let productSearchRequest: any = {};
    if (!this.vendorId.value) {
      this.vendorId.setValue(1);
    }
    const uomQuery = this.getUomQuery();
    productSearchRequest.searchString = event ? event.target.value : '';
    productSearchRequest.uomQuery = uomQuery;
    productSearchRequest.businessAccountId = this.vendorId.value;
    productSearchRequest.specificVendorId = this.vendorId.value;
    productSearchRequest.loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;

    if (productCategoryId) {
      productSearchRequest.productCategoryId = productCategoryId;
    }

    if (favourite) {
      productSearchRequest.isFavourite = true;
    }

    const debounceSubject = new Subject<any>();
    debounceSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.orderManagementService
          .Get_ALL_Products_List_For_PurchaseOrder(productSearchRequest)
          .pipe(debounceTime(500), distinctUntilChanged())
          .subscribe((res) => {
            this.productsList = res?.content;
            if (
              (productCategoryId || productSearchRequest.isFavourite) &&
              this.productsList?.length > 0
            ) {
              this.productPackages.controls =
                this.productPackages.controls.filter(
                  (control) => control.get('productId').value != null
                );
              res?.content.forEach((product) => {
                const existingProduct = this.productPackages.controls.find(
                  (control) => control.get('productId').value === product.id
                );
                if (!existingProduct) {
                  const productPackageForm =
                    this.billFormsService.createProductPackageGroup();
                  productPackageForm.patchValue(product, {
                    emitEvent: false,
                    onlySelf: true,
                  });
                  productPackageForm.get('productDetails').patchValue(product, {
                    emitEvent: false,
                    onlySelf: true,
                  });
                  if (
                    [
                      'CONTAINER_40_FT',
                      'CONTAINER_20_FT',
                      'CONTAINER_40_FT_HQ',
                    ]?.includes(this.buyingType?.value)
                  ) {
                    productPackageForm
                      .get('quantity')
                      .patchValue(product?.containerMqo ?? 1);
                  } else {
                    productPackageForm.get('quantity').patchValue(1);
                  }
                  productPackageForm.get('id').patchValue(null);
                  productPackageForm.get('productId').patchValue(product.id);
                  productPackageForm
                    .get('packageId')
                    .patchValue(product.skuPackageId);
                  this.productPackages.push(productPackageForm);
                }
              });
              this.calculateValues();
            }
          });
      });
    debounceSubject.next(event);
  }

  onClickMyCategory() {
    if (!this.isEditable) {
      return;
    }
    this.getProductsList(null, this.currentBusinessAccount?.productCategoryIds);
  }

  onClickMyFavourite() {
    if (!this.isEditable) {
      return;
    }
    this.getProductsList(null, null, true);
  }

  isSelfProduct(productDetails: any) {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    return productDetails?.audit?.businessAccountId == loggedInAccountId
      ? true
      : false;
  }

  checkIfAnyProductIsSelfProduct() {
    const productPackages = this.productPackages.get(
      'productPackages'
    ) as UntypedFormArray;
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    const ind = productPackages?.value.findIndex(
      (productPackage) =>
        productPackage.productDetails?.audit?.businessAccountId ==
        loggedInAccountId
    );
    return ind == -1 ? false : true;
  }

  calculateValues() {
    this.calculate.emit(null);
  }

  toggleType(value: any) {
    if (!this.isEditable) {
      return;
    }
    this.billForm.get('importLocalType').setValue(value);
  }
  get importLocalType() {
    return this.billForm.get('importLocalType');
  }

  get status() {
    return this.billForm.get('status');
  }

  get isEditable() {
    return (
      this.status.value != 'CONFIRMED' &&
      this.status.value != 'REJECTED' &&
      !this.billForm.get('isQuickCheckout').value
    );
  }

  get incoTermId() {
    return this.billForm.get('incoTermId');
  }
  get departurePortId() {
    return this.billForm.get('departurePortId');
  }
  get buyingType() {
    return this.billForm.get('buyingType');
  }
  get vendorId() {
    return this.billForm.get('requestTo').get('id');
  }
  get customerId() {
    return this.billForm.get('requestFrom').get('id');
  }

  onChangeVendor() {
    const vendor = this.businessAccountService.vendorList.find(
      (vendor) => vendor.relationAccountId == this.vendorId.value
    );
    this.incoTermId.setValue(vendor?.incoTermId);
    this.departurePortId.setValue(vendor?.portId);
    if (vendor?.isImportExport) {
      this.importLocalType.setValue('CONTAINER');
      this.buyingType.setValue('CONTAINER_40_FT_HQ');
    }
    if (vendor?.fulfillmentLimitInDays) {
      this.billForm.get('requiredByDate').setValue(null);
      const currentDate = new Date();
      const futureDate = new Date(
        currentDate.getTime() +
          vendor?.fulfillmentLimitInDays * 24 * 60 * 60 * 1000
      );
      this.billForm
        .get('requiredByDate')
        .setValue(futureDate.toISOString().split('T')[0]);
      this.minRequiredDate = futureDate.toISOString().split('T')[0];
    }
    this.productsList = [];
  }

  get noteId() {
    return this.billForm.get('noteTemplate').get('id');
  }

  get media_url_ids() {
    return this.billForm.get('media_url_ids');
  }

  get media_urls() {
    return this.billForm.get('media_urls');
  }

  getNoteTitle() {
    const item = this.businessAccountService.notesList.find(
      (item) => item.id == this.noteId.value
    );
    return item?.description ?? '';
  }

  getUomQuery() {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    return uomQuery;
  }
  generatePdf() {
    if (!this.route.snapshot.params.id) {
      this.toastr.error('PO is not created yet');
      return;
    }
    const uomQuery = this.getUomQuery();
    this.orderManagementService
      .generatePdf(
        this.route.snapshot.params.id,
        this.vendorId.value,
        this.buyingType.value,
        uomQuery
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response.body!], { type: 'application/pdf' });
          const contentDisposition = response.headers.get(
            'Content-Disposition'
          );
          const filenameMatch = contentDisposition.split('=');
          const filename = filenameMatch[1];
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename ?? 'purchase_order.pdf';
          link.click();
          URL.revokeObjectURL(link.href);
        },
        (err) => {
          this.toastr.error(err?.error.userMessage ?? 'Some error Occured');
        }
      );
  }


    async generateBillFromPdf(file: any) {
      if (this.status.value == 'CONFIRMED') {
        this.toastr.error("You can't upload Bill in Confirmed Status");
        return;
      }
      try {
        const formData = new FormData();
        formData.append('orderQuotation', file);
        const data = await this.orderManagementService
          .generatePoFromPdf(formData, null)
          .toPromise();
        if (data.status == 'FAILED') {
          this.toastr.warning(data?.error);
        }
        this.billFile = file;
        this.openCompareDialog(data);
      } catch (err: any) {
        console.log(err);
        this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
      }
    }
  
    openCompareDialog(data) {
      let dialogRef = this.dialog.open(PricecompareDialogComponent, {
        height:'90%',
        width: '90%',
        data: data
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.patchEditData.emit(result);
        }
      });
    }


}
