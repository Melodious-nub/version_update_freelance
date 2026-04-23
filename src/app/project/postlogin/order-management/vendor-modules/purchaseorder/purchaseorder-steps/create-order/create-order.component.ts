import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
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
import { OrderManagementService } from '../../../../service/order-management.service';
import { OrderFormsService } from '../../../../service/order-forms.service';
import { PrintService } from 'src/app/service/print.service';
import { MatDialog } from '@angular/material/dialog';
import { PricecompareDialogComponent } from 'src/app/shared/component/pricecompare-dialog/pricecompare-dialog.component';
import { OrderTransactionPackagesComponent } from '../../../../../../../shared/component/order-transaction-packages/order-transaction-packages.component';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { DadyinInputComponent } from '../../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { DadyinSelectComponent } from '../../../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { NgIf, NgFor } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchableSelectComponent } from '../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';
@Component({
    selector: 'app-create-order',
    templateUrl: './create-order.component.html',
    styleUrls: ['./create-order.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        DadyinSearchableSelectComponent,
        DadyinButtonComponent,
        NgIf,
        DadyinSelectComponent,
        DadyinInputComponent,
        MatAutocompleteTrigger,
        MatAutocomplete,
        NgFor,
        MatOption,
        OrderTransactionPackagesComponent,
    ],
})
export class CreateOrderComponent implements OnInit {
  currentBusinessAccount: any;
  htmlContent: any;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map2 = false;
    this.map1 = false;
    this.map3 = false;
  }

  map2 = false;
  map1 = false;
  map3 = false;
  @Input() componentUoms: any;
  productsList: any;
  quotationsList: any;
  @Input() purchaseOrderForm: UntypedFormGroup;
  @Output() generatePdf = new EventEmitter();
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

  poFile = null;

  constructor(
    public fb: UntypedFormBuilder,
    public ordermanagementService: OrderManagementService,
    public orderFormService: OrderFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService,
    public router: Router,
    public productService: ProductService,
    public ref: ChangeDetectorRef,
    public printService: PrintService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.businessAccountService.Get_All_Notes();
    this.businessAccountService.Get_All_Vendors();
    this.businessAccountService.Get_All_Exporter_Vendors();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_paymentTerms();
    this.containerService.Get_All_employees();
    this.containerService.Get_All_Container_List(0, 100, 'asc', null);
    this.setDatas();
    this.getProductAttributeSetsByCategory();

    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });

    if (this.route.snapshot.queryParams?.vendorId) {
      this.vendorId.patchValue(
        Number(this.route.snapshot.queryParams?.vendorId)
      );
    }
  }

  getProductAttributeSetsByCategory() {
    this.ordermanagementService
      .getProductAttributeSetByCategory('PURCHASE_ORDER')
      .subscribe((res: any) => {
        this.productAttributeSets = res?.data;
      });
  }

  setDatas() {
    const currentDate = new Date();
    const expectedByDate = new Date(
      currentDate.getTime() + 45 * 24 * 60 * 60 * 1000
    );
    const editTillDate = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    this.purchaseOrderForm
      .get('date')
      .setValue(currentDate.toISOString().split('T')[0]);
    this.purchaseOrderForm
      .get('expectedByDate')
      .setValue(expectedByDate.toISOString().split('T')[0]);
    this.purchaseOrderForm
      .get('editTillDate')
      .setValue(editTillDate.toISOString().split('T')[0]);
    this.purchaseOrderForm.get('loadingTypeId').setValue('FLOOR');
  }

  getQuotationsList(event: any) {
    if (this.vendorId.value) {
      var filter = `&filter=requestTo.id:${this.vendorId.value}`;
    }
    this.ordermanagementService
      .Get_All_RecQuotations(null, null, null, null, filter)
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((quotations) => {
        this.quotationsList = quotations.content;
      });
  }

  onSelectQuotation(quotation: any) {
    this.purchaseOrderForm
      .get('referenceOrder')
      .get('quotationId')
      .patchValue(quotation?.id);
    this.purchaseOrderForm.get('requestFrom').patchValue(quotation?.requestTo);
    this.purchaseOrderForm.get('requestTo').patchValue(quotation?.requestFrom);
    delete quotation.id;
    delete quotation.status;
    delete quotation.transactionId;
    delete quotation.requestTo;
    delete quotation.requestFrom;
    quotation.productPackages.forEach((product) => {
      product.id = null;
    });
    this.patchEditData.emit(quotation);
  }

  get productPackages() {
    return this.purchaseOrderForm.get('productPackages') as UntypedFormArray;
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

  get requestFromAddress() {
    const itm = this.purchaseOrderForm.get('requestFrom').value;
    return itm ? itm?.address : '';
  }

  get requestToAddress() {
    const id = this.purchaseOrderForm.get('requestTo').value.id;
    const item = this.businessAccountService.vendorList.find(
      (vendor) => vendor.relationAccountId == Number(id)
    );
    return item?.address?.addressLine ?? '';
  }

  getProductsList(
    event: any,
    productCategoryIdArray?: any,
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

    if (productCategoryIdArray) {
      productSearchRequest.productCategoryId = productCategoryIdArray;
    }

    if (favourite) {
      productSearchRequest.isFavourite = true;
    }

    const debounceSubject = new Subject<any>();
    debounceSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.ordermanagementService
          .Get_ALL_Products_List_For_PurchaseOrder(productSearchRequest)
          .pipe(debounceTime(500), distinctUntilChanged())
          .subscribe((res) => {
            this.productsList = res?.content;
            if (
              (productCategoryIdArray || productSearchRequest.isFavourite) &&
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
                    this.orderFormService.productPackageForm();
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
    this.purchaseOrderForm.get('importLocalType').setValue(value);
  }

  
  get importLocalType() {
    return this.purchaseOrderForm.get('importLocalType');
  }

  get status() {
    return this.purchaseOrderForm.get('status');
  }

  get isEditable() {
    return (
      this.status.value != 'CONFIRMED' &&
      this.status.value != 'REJECTED' &&
      !this.purchaseOrderForm.get('isQuickCheckout').value
    );
  }

  get incoTermId() {
    return this.purchaseOrderForm.get('incoTermId');
  }
  get departurePortId() {
    return this.purchaseOrderForm.get('departurePortId');
  }
  get buyingType() {
    return this.purchaseOrderForm.get('buyingType');
  }
  get vendorId() {
    return this.purchaseOrderForm.get('requestTo').get('id');
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
      this.purchaseOrderForm.get('requiredByDate').setValue(null);
      const currentDate = new Date();
      const futureDate = new Date(
        currentDate.getTime() +
          vendor?.fulfillmentLimitInDays * 24 * 60 * 60 * 1000
      );
      this.purchaseOrderForm
        .get('requiredByDate')
        .setValue(futureDate.toISOString().split('T')[0]);
    }
    this.productsList = [];
  }

  async generatePoFromPdf(file: any) {
    if (this.status.value == 'CONFIRMED') {
      this.toastr.error("You can't upload PO in Confirmed Status");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('orderQuotation', file);
      const data = await this.ordermanagementService
        .generatePoFromPdf(formData, this.vendorId.value)
        .toPromise();
      if (data.status == 'FAILED') {
        this.toastr.warning(data?.error);
      }
      this.poFile = file;
      this.openCompareDialog(data);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.error ?? 'Some Error Occurred');
    }
  }

  openCompareDialog(data) {
    let dialogRef = this.dialog.open(PricecompareDialogComponent, {
      width: '90%',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.patchEditData.emit(result);
      }
    });
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

  printPdf() {
    this.generatePdf.emit()
  }


}
