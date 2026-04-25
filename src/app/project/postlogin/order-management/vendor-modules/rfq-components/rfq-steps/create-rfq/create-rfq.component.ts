import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { PricecompareDialogComponent } from 'src/app/shared/component/pricecompare-dialog/pricecompare-dialog.component';
import { OrderTransactionPackagesComponent } from '../../../../../../../shared/component/order-transaction-packages/order-transaction-packages.component';
import { DadyinInputComponent } from '../../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { DadyinSelectComponent } from '../../../../../../../shared/widgets/dadyin-select/dadyin-select.component';

import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchableSelectComponent } from '../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-create-rfq',
    templateUrl: './create-rfq.component.html',
    styleUrls: ['./create-rfq.component.scss'],
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
export class CreateRfqComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map2 = false;
    this.map1 = false;
    this.map3 = false;
  }

  map2 = false;
  map1 = false;
  map3 = false;
  searchProductCode = new Subject();
  searchProductDescription = new Subject();
  @Input() componentUoms: any;
  @Input() rfqForm: UntypedFormGroup;
  @Output() calculate = new EventEmitter();
  @Output() patchEditData = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  productsList: any;

  minRequiredDate: any = new Date().toISOString().split('T')[0];
  currentBusinessAccount: any;

  rfqFile: any = null;

  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];

  constructor(
    public fb: UntypedFormBuilder,
    public ordermanagementService: OrderManagementService,
    public orderFormService: OrderFormsService,
    public route: ActivatedRoute,
    public router: Router,
    public toastr: ToastrService,
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.businessAccountService.Get_All_Notes();
    this.businessAccountService.Get_All_Vendors();
    this.businessAccountService.Get_All_Exporter_Vendors();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_paymentTerms();
    this.containerService.Get_All_employees();
    this.containerService.Get_All_Container_List(0, 100, 'asc', null);
    this.ordermanagementService.currentRouteId = this.route.snapshot.params.id;
    if (this.route.snapshot.queryParams?.vendorId) {
      this.vendorId.patchValue(
        Number(this.route.snapshot.queryParams?.vendorId)
      );
    }

    this.searchProductDescription
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((res) => {
        let productSearchRequest: any = {};
        if (!this.vendorId.value) {
          this.vendorId.setValue(1);
        }
        let uomQuery = ``;
        this.componentUoms.controls.forEach((element) => {
          element.get('columnMappings').value.forEach((col) => {
            uomQuery =
              uomQuery +
              `&uomMap[${col}]=${element.get('userConversionUom').value}`;
          });
        });
        productSearchRequest.searchString = res;
        productSearchRequest.uomQuery = uomQuery;
        productSearchRequest.businessAccountId = this.vendorId.value;
        productSearchRequest.loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId;
        this.ordermanagementService
          .Get_ALL_Products_List(productSearchRequest)
          .subscribe((res) => {
            this.productsList = res?.content;
          });
      });
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });
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
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
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
        this.ordermanagementService
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

  get productPackages() {
    return this.rfqForm.get('productPackages') as UntypedFormArray;
  }

  get messages() {
    return this.rfqForm.get('messages') as UntypedFormArray;
  }

  get status() {
    return this.rfqForm.get('status');
  }
  get isEditable() {
    return this.status.value != 'CONFIRMED' && this.status.value != 'REJECTED';
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
      (item) => item.relationAccountId == this.vendorId.value
    );
    console.log(item, this.vendorId.value);
    return item ? item?.address?.addressLine : '';
  }
  // end

  onChange(item, productPackage: UntypedFormGroup) {
    productPackage.patchValue(item, {
      emitEvent: false,
      onlySelf: true,
    });
    productPackage.get('productDetails').patchValue(item, {
      emitEvent: false,
      onlySelf: true,
    });
    productPackage.get('id').patchValue(null);
    productPackage.get('productId').patchValue(item.id);
    productPackage.get('packageId').patchValue(item.skuPackageId);
    console.log(item?.productMetaBusinessAccountId + " " + item?.productBusinessAccountId)
    productPackage.get('productDetails').get('productMetaBusinessAccountId').patchValue(item?.productMetaBusinessAccountId);
    productPackage.get('productDetails').get('productBusinessAccountId').patchValue(item?.productBusinessAccountId);
    this.calculateValues();
  }

  onClickMyFavourite() {
    if (!this.isEditable) {
      return;
    }
    this.getProductsList(null, null, true);
  }
  calculateValues() {
    this.calculate.emit(null);
  }

  toggleType(value: any) {
    this.rfqForm.get('importLocalType').setValue(value);
  }
  get importLocalType() {
    return this.rfqForm.get('importLocalType');
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
  get vendorId() {
    return this.rfqForm.get('requestTo').get('id');
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
      this.rfqForm.get('requiredByDate').setValue(null);
      const currentDate = new Date();
      const futureDate = new Date(
        currentDate.getTime() +
        vendor?.fulfillmentLimitInDays * 24 * 60 * 60 * 1000
      );
      this.rfqForm
        .get('requiredByDate')
        .setValue(futureDate.toISOString().split('T')[0]);
      this.minRequiredDate = futureDate.toISOString().split('T')[0];
    }
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
        .generatePoFromPdf(formData, null)
        .toPromise();
      if (data.status == 'FAILED') {
        this.toastr.warning(data?.error);
      }
      this.rfqFile = file;
      this.openCompareDialog(data);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
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


}
