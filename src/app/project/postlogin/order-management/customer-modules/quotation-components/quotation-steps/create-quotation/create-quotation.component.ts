import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output, OnDestroy,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { OrderFormsService } from '../../../../service/order-forms.service';
import { OrderManagementService } from '../../../../service/order-management.service';
import { ApiService } from 'src/app/service/api.service';
import { PricecompareDialogComponent } from 'src/app/shared/component/pricecompare-dialog/pricecompare-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OrderTransactionPackagesComponent } from '../../../../../../../shared/component/order-transaction-packages/order-transaction-packages.component';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { DadyinInputComponent } from '../../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { DadyinSelectComponent } from '../../../../../../../shared/widgets/dadyin-select/dadyin-select.component';

import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchableSelectComponent } from '../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-create-quotation',
    templateUrl: './create-quotation.component.html',
    styleUrls: ['./create-quotation.component.scss'],
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
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        OrderTransactionPackagesComponent
    ]
})
export class CreateQuotationComponent implements OnInit, AfterViewInit, OnDestroy {
  tierPriceView = false;
  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];

  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map2 = false;
    this.map1 = false;
    this.map3 = false;
  }

  map2 = false;
  map1 = false;
  map3 = false;
  rcvrfqList: any;
  @Input() componentUoms: any;
  currentBusinessAccount: any;
  productsList: any[] = [];
  @Input() quotationForm: UntypedFormGroup;
  @Output() calculate = new EventEmitter();
  @Output() patchEditData = new EventEmitter();

  @Output() generatePdf = new EventEmitter();

  quotationFile: any = null;

  private ngUnsubscribe: Subject<void> = new Subject();

  constructor(
    public fb: UntypedFormBuilder,
    public formsService: FormsService,
    public orderFormsService: OrderFormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public orderManagementService: OrderManagementService,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
      this.quotationForm
        .get('requestFrom')
        .get('id')
        .patchValue(this.currentBusinessAccount?.id);
    });
  //DAD-866 Issue #1
  this.containerService.Get_All_employees();
    this.setDatas();
  }




  ngAfterViewInit() {
    this.businessAccountService.Get_All_Lcp().subscribe((res: any) => {
      this.businessAccountService.lcpList = res;
      if (this.route.snapshot.queryParams?.customerId) {
        this.customerId.patchValue(
          Number(this.route.snapshot.queryParams?.customerId)
        );
        this.getCustomerDetails();
        this.onClickMyCategory();
      }
      if (this.route.snapshot.queryParams?.productCategoryId) {
        this.getProductsList(null, [
          this.route.snapshot.queryParams?.productCategoryId,
        ]);
      }
    });
  }



  async getCustomerDetails(changed = false) {
    try {
      let relationAccount = this.businessAccountService.lcpList.filter(
        (data) => data.relationAccountId == this.customerId.value
      );
      const data = await this.apiService
        .Get_Single_customer(relationAccount[0]?.id)
        .toPromise();
      console.log(data)
      this.quotationForm.get('buyingCapacityType').setValue(data?.buyingType ? data?.buyingType : 'SKU' );
      this.quotationForm.get('buyingType').setValue(data?.buyingType ? data?.buyingType : 'SKU');
      this.quotationForm.get('discountPercentage').setValue(data?.discountPercentage ? data?.discountPercentage : 0);
      this.quotationForm.get('buyingCapacityDefault').setValue(data?.buyingType ? data?.buyingType : 'SKU');
      this.quotationForm.get('discountPercentageDefault').setValue(data?.discountPercentage ? data?.discountPercentage : 0);
      if (changed && this.productPackages.controls[0].get('productId').value > 0) {
        this.calculateValues();
      }    
    }
    catch (error) {
      console.log(error);
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
    this.quotationForm
      .get('date')
      .setValue(currentDate.toISOString().split('T')[0]);
    this.quotationForm
      .get('expectedByDate')
      .setValue(expectedByDate.toISOString().split('T')[0]);
    this.quotationForm
      .get('editTillDate')
      .setValue(editTillDate.toISOString().split('T')[0]);
    this.quotationForm.get('loadingTypeId').setValue('FLOOR');
  }

  get isEditable() {
    return (
      this.status.value != 'CONFIRMED' &&
      this.status.value != 'REJECTED' &&
      !this.quotationForm.get('isQuickCheckout').value
    );
  }

  get productPackages() {
    return this.quotationForm.get('productPackages') as UntypedFormArray;
  }

  get messages() {
    return this.quotationForm.get('messages') as UntypedFormArray;
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
      console.log(this.map2);
    }
    if (type == 3) {
      this.map3 = !this.map3;
    }
  }

  get status() {
    return this.quotationForm.get('status');
  }

  onChange(item, productPackage: UntypedFormGroup) {
    productPackage.patchValue(item, {
      emitEvent: false,
      onlySelf: true,
    });
    productPackage.get('productDetails').patchValue(item, {
      emitEvent: false,
      onlySelf: true,
    });
    if (
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      )
    ) {
      productPackage.get('quantity').patchValue(item?.containerMqo);
    } else {
      productPackage.get('quantity').patchValue(1);
    }
    productPackage.get('id').patchValue(null);
    productPackage.get('productId').patchValue(item.id);
    productPackage.get('packageId').patchValue(item.skuPackageId);
    productPackage.get('productDetails').get('productMetaBusinessAccountId').patchValue(item?.productMetaBusinessAccountId);
    productPackage.get('productDetails').get('productBusinessAccountId').patchValue(item?.productBusinessAccountId);

    this.calculateValues();
  }

  get requestToAddress() {
    const item = this.businessAccountService.lcpList.find(
      (item) => item.relationAccountId == Number(this.customerId.value)
    );
    if (!item || !item.address) {
      return '';
    }
    const addressFields = [
      item.address.addressLine,
      item.address.addressCity,
      item.address.addressState,
      item.address.addressZipCode,
      item.address.addressCountry,
    ].filter((field) => !!field);
    return addressFields.join(',');
  }

  // end
  get buyingType() {
    return this.quotationForm.get('buyingType');
  }

  addProductPackage() {
    this.productPackages.push(this.orderFormsService.productPackageForm());
  }

  removeProductPackage(i) {
    this.productPackages.removeAt(i);
    this.calculateValues();
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

  getProductsList(
    event: any,
    productCategoryIdArray?: any,
    favourite: boolean = false
  ) {
    const productSearchRequest: any = {
      searchString: event ? event.target.value : '',
      uomQuery: this.getUomQuery(),
      businessAccountId: this.customerId.value,
      loggedInAccountId: this.businessAccountService.currentBusinessAccountId,
    };

    if (favourite) {
      productSearchRequest.isFavourite = true;
    }

    const performSearch = () => {
      this.orderManagementService
        .Get_ALL_Products_List_For_ReceivedPurchaseOrder(productSearchRequest)
        .subscribe((res) => {
          this.productsList = res?.content;
          if (productCategoryIdArray && this.productsList?.length > 0) {
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
                  this.orderFormsService.productPackageRfqForm();
                productPackageForm.patchValue(product, {
                  emitEvent: false,
                  onlySelf: true,
                });
                productPackageForm
                  .get('productDetails')
                  .patchValue(product, { emitEvent: false, onlySelf: true });
                productPackageForm
                  .get('quantity')
                  .patchValue(
                    [
                      'CONTAINER_40_FT',
                      'CONTAINER_20_FT',
                      'CONTAINER_40_FT_HQ',
                    ].includes(this.buyingType?.value)
                      ? product?.containerMqo
                      : 1
                  );
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

          if (this.productsList?.length == 0) {
            this.toastr.warning('No products found for the selected category');
          }
        });
    };

    if (productCategoryIdArray) {
      this.apiService
        .Get_Categories_DetailByIds(productCategoryIdArray)
        .subscribe((res: any[]) => {
          let filterParts: string[] = [];

          let categoryFilters: string[] = [];

          res?.forEach((category) => {
            let productTypeIds: number[] = [];
            let productSubTypeIds: number[] = [];

            category?.categoryProductTypes?.forEach((pt) => {
              if (pt.productTypeId != null) {
                productTypeIds.push(pt.productTypeId);
              }
              productSubTypeIds.push(
                ...(pt.productSubTypeIds?.filter((id) => id != null) || [])
              );
            });

            let parts: string[] = [];
            if (productTypeIds.length > 0) {
              parts.push(
                `productTypeId in (${[...new Set(productTypeIds)].join(',')})`
              );
            }
            if (productSubTypeIds.length > 0) {
              parts.push(
                `productSubTypeId in (${[...new Set(productSubTypeIds)].join(
                  ','
                )})`
              );
            }

            if (parts.length > 0) {
              categoryFilters.push(`(${parts.join(' and ')})`);
            }
          });

          const finalFilter = categoryFilters.join(' or ');
          filterParts.push(finalFilter);

          if (filterParts.length > 0) {
            productSearchRequest.filter = `&filter=${filterParts.join(
              '&filter='
            )}`;
          }

          // productSearchRequest.productCategoryId = productCategoryIdArray;

          // Debounce the final search call
          const debounceSubject = new Subject<any>();
          debounceSubject
            .pipe(debounceTime(500), distinctUntilChanged())
            .subscribe(() => performSearch());

          debounceSubject.next(event);
        });
    } else {
      // No categories selected, just debounce the regular search
      const debounceSubject = new Subject<any>();
      debounceSubject
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(() => performSearch());

      debounceSubject.next(event);
    }
  }
  get customerId() {
    return this.quotationForm.get('requestTo').get('id');
  }

  calculateValues() {
    this.calculate.emit(null);
  }

  getRcvRfqList() {
    this.orderManagementService.Get_All_RecEnquiries().subscribe((res) => {
      if (res?.content?.length == 0) {
        this.toastr.warning('No RFQs Found');
        return;
      }
      this.rcvrfqList = res.content;
    });
  }

  onSelectRfq(rfq: any) {
    this.quotationForm
      .get('referenceOrder')
      .get('rfQuotationId')
      .patchValue(rfq?.id);
    this.quotationForm.get('requestFrom').patchValue(rfq?.requestTo);
    this.quotationForm.get('requestTo').patchValue(rfq?.requestFrom);
    this.quotationForm.get('incoTermId').patchValue(rfq?.incoTermId);
    this.quotationForm.get('departurePortId').patchValue(rfq?.departurePortId);
    this.quotationForm.get('buyingType').patchValue(rfq?.buyingType);
    this.quotationForm.get('importLocalType').patchValue(rfq?.importLocalType);
    rfq.productPackages.forEach((product) => {
      product.id = null;
    });
    this.patchEditData.emit(rfq);
  }

  toggleType(value: any) {
    this.quotationForm.get('importLocalType').setValue(value);
  }

  get importLocalType() {
    return this.quotationForm.get('importLocalType');
  }

  get noteId() {
    return this.quotationForm.get('noteTemplate').get('id');
  }

  get media_url_ids() {
    return this.quotationForm.get('media_url_ids');
  }

  get media_urls() {
    return this.quotationForm.get('media_urls');
  }



  getNoteTitle() {
    const item = this.businessAccountService.notesList.find(
      (item) => item.id == this.noteId.value
    );
    return item?.description ?? '';
  }

  fileSelected(event: any, type: string, fileInput: HTMLInputElement) {
    event.preventDefault(); // Prevent default behavior
    if (type === 'drop') {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.generatePoFromPdf(files[0]);
        fileInput.value = ''; // Clear the file input after selection
      }
    } else {
      const files = fileInput.files;
      if (files && files.length > 0) {
        this.generatePoFromPdf(files[0]);
        fileInput.value = ''; // Clear the file input after selection
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevent default behavior
  }

  updateProductQuantityInOrder(i, quantity) {
    const quantityControl = this.productPackages.controls[i].get('quantity');
    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    quantityControl.patchValue(quantityControl.value + quantity);
    if (
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      ) &&
      quantityControl.value <
      this.productPackages.controls[i].value.productDetails?.containerMqo
    ) {
      this.toastr.warning(
        "Quantity Can't be Less than Container MQO " +
        this.productPackages.controls[i].value.productDetails?.containerMqo
      );
      quantityControl.patchValue(
        this.productPackages.controls[i].value.productDetails?.containerMqo
      );
      return;
    }
    this.calculateValues();
  }

  changeQuantityInOrder(i) {
    const productControl = this.productPackages.controls[i];
    const quantityControl = this.productPackages.controls[i].get('quantity');

    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    quantityControl.patchValue(quantityControl.value);
    if (
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      ) &&
      quantityControl.value < productControl.value.productDetails?.containerMqo
    ) {
      this.toastr.warning(
        "Quantity Can't be Less than Container MQO " +
        productControl.value.productDetails?.containerMqo
      );
      quantityControl.patchValue(
        productControl.value.productDetails?.containerMqo
      );
      return;
    }
    this.calculateValues();
  }

  onClickMyCategory() {
    if (!this.isEditable) {
      return;
    }
    if (!this.customerId.value) {
      this.toastr.error('Please select customer');
      return;
    }
    this.getProductsAsPerCustomer();
  }

  getProductsAsPerCustomer(isFavourite = false) {
    this.businessAccountService
      .getBusinessAccountDetail(this.customerId.value)
      .subscribe((res) => {
        let relationAccount = this.businessAccountService.lcpList.filter(
          (data) => data.relationAccountId == this.customerId.value
        );

        let relationProductCategories =
          relationAccount[0]?.productCategoryIdList?.split(',');
        let finalProductCategoryList = '';
        if (relationProductCategories && relationProductCategories.length > 0) {
          relationProductCategories.forEach(
            (id) =>
            (finalProductCategoryList =
              finalProductCategoryList + id.replaceAll('#', '') + ',')
          );
        }
        let businessLevelProductCategories = res?.productCategoryIds;
        if (
          !businessLevelProductCategories ||
          businessLevelProductCategories.length === 0
        ) {
          finalProductCategoryList = finalProductCategoryList.endsWith(',')
            ? finalProductCategoryList.slice(0, -1)
            : finalProductCategoryList;
        } else {
          finalProductCategoryList =
            finalProductCategoryList + businessLevelProductCategories;
        }
        let productCategoryIdArray;
        if (finalProductCategoryList && finalProductCategoryList.length > 0) {
          productCategoryIdArray = finalProductCategoryList.split(',');
        }
        if (productCategoryIdArray?.length == 0 || !productCategoryIdArray) {
          productCategoryIdArray = [81]; // Default to master category if no categories assigned
        }

        this.getProductsList(null, productCategoryIdArray, isFavourite);
      });
  }

  onClickMyFavourite() {
    if (!this.isEditable) {
      return;
    }
    this.getProductsAsPerCustomer(true);
  }

  async generatePoFromPdf(file: any) {
    if (this.status.value == 'CONFIRMED') {
      this.toastr.error("You can't upload Quotation in Confirmed Status");
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
      this.quotationFile = file;
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

  selectOption(option: boolean) {
    this.quotationForm.get('isRegularPrice')?.setValue(option);
    if (option) {
      this.tierPriceView = false;
    } else {
      this.tierPriceView = true;
    }

  }


  get buyingCapacityType() {
    return this.quotationForm.get('buyingCapacityType');
  }

}
