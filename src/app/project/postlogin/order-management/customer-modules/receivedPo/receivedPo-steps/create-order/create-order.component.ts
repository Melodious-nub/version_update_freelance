import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { OrderManagementService } from '../../../../service/order-management.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { OrderFormsService } from '../../../../service/order-forms.service';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { ProductService } from 'src/app/project/postlogin/product-management/product/service/product.service';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { QcProductDetailComponent } from 'src/app/project/postlogin/quick-checkout/qc-product-detail/qc-product-detail.component';
import { PricecompareDialogComponent } from 'src/app/shared/component/pricecompare-dialog/pricecompare-dialog.component';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
})
export class CreateOrderComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map2 = false;
    this.map1 = false;
    this.map3 = false;
  }
  quotationsList: any[] = [];
  imgUrl = environment.imgUrl;
  map2 = false;
  map1 = false;
  map3 = false;
  @Input() componentUoms: any;
  productsList: any;
  files: any[] = [];
  @Input() receivedPoForm: UntypedFormGroup;
  @Input() isSelfPO: any;
  @Output() calculate = new EventEmitter();
  @Output() patchEditData = new EventEmitter();
  @Output() generatePdf = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];

  quotationTransactionId = new UntypedFormControl();
  htmlContent: any;
  constructor(
    public fb: UntypedFormBuilder,
    public orderManagementService: OrderManagementService,
    public orderFormsService: OrderFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService,
    public router: Router,
    public productService: ProductService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.businessAccountService.Get_All_Exporter_Vendors();

    if (this.isCreatedByMe) {
      this.businessAccountService.Get_All_Customers_Non_Cache();
    }

    this.businessAccountService.Get_All_Notes();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_paymentTerms();
    this.containerService.Get_All_employees();
    this.containerService.Get_All_Container_List(0, 100, 'asc', null);

    if (this.route.snapshot.queryParams?.customerId) {
      if (this.route.snapshot.queryParams?.customerId) {
        this.customerId.patchValue(
          Number(this.route.snapshot.queryParams?.customerId)
        );
      }
    }
  }

  get isCreatedByMe() {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    return (
      this.receivedPoForm.value?.audit?.businessAccountId ==
        loggedInAccountId || this.receivedPoForm.value?.status !== 'CONFIRMED'
    );
  }

  get productPackages() {
    return this.receivedPoForm.get('productPackages') as UntypedFormArray;
  }

  get orderId() {
    return this.receivedPoForm.get('id');
  }

  onChangeCustomer() {
    const customer = this.businessAccountService.customerList.find(
      (customer) => customer.relationAccountId == this.customerId.value
    );
    this.productsList = [];
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  calculateValues() {
    const invalidProductPackageIndex = this.productPackages.controls.findIndex(
      (productPackage) => !productPackage.get('productId').value
    );

    if (invalidProductPackageIndex !== -1) {
      this.toastr.warning(
        `Please select a product in empty row at ${
          invalidProductPackageIndex + 1
        } position`
      );
      return;
    }
    this.calculate.emit(null);
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
  onChangePercentage(control: UntypedFormControl, type: string) {
    const value = control.value;
    if (value > 100) {
      this.toastr.warning('Percentage cannot be greater than 100');
      control.patchValue(100);
    } else if (value < 0) {
      this.toastr.warning('Percentage cannot be less than 100');
      control.patchValue(0);
    }
    this.receivedPoForm.get(type).setValue('PERCENTAGE');
    this.checkIfNullOrEmpty();
    this.calculateValues();
  }

  onChangeCost(control: any, type) {
    this.receivedPoForm.get(type).setValue('COST');
    this.checkIfNullOrEmpty();
    this.calculateValues();
  }

  checkIfNullOrEmpty() {
    if (!this.receivedPoForm.get('discountType').value) {
      this.receivedPoForm.get('discountType').setValue('PERCENTAGE');
    }

    if (!this.receivedPoForm.get('salesTaxType').value) {
      this.receivedPoForm.get('salesTaxType').setValue('PERCENTAGE');
    }
  }

  onSelectQuotation(quotation: any) {
    this.receivedPoForm
      .get('referenceOrder')
      .get('quotationId')
      .patchValue(quotation.id);

    this.orderManagementService
      .getQuotationById(quotation.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async (res: any) => {
        this.quotationTransactionId.patchValue(res.transactionId);
        delete res.transactionId;
        delete res.status;
        delete res.id;
        delete res.audit;
        delete res.referenceOrder;
        res.productPackages.forEach((productPackage) => {
          productPackage.id = null;
        });
        res.requestFrom = res.requestTo;
        delete res.requestTo;
        this.patchEditData.emit(res);
      });
  }

  copyProductForAccount(productPackage, index, cloneForCustomisation) {
    this.orderManagementService
      .copyProductForAccount(
        productPackage.packageId,
        productPackage.productId,
        this.receivedPoForm.getRawValue()?.id,
        cloneForCustomisation
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.productService.clonePayload = res;
          this.router.navigateByUrl(
            `/home/product-management/product/add?productIndex=${index}&receivedPOId=${this.route.snapshot.params.id}`
          );
          if (!this.orderManagementService.productIndexList.includes(index)) {
            this.orderManagementService.productIndexList.push(index);
          }
          this.toastr.success('Click on the Clone button to confirm');
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  get requestFromAddress() {
    const item = this.businessAccountService.customerList.find(
      (item) => item.relationAccountId == this.customerId.value
    );
    return item
      ? item?.address?.addressLine +
          ',' +
          item?.address?.addressCity +
          ',' +
          item?.address?.addressState +
          ',' +
          item?.address?.addressZipCode +
          ',' +
          item?.address?.addressCountry
      : '';
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

  toggleType(value: any) {
    this.receivedPoForm.get('importLocalType').setValue(value);
  }

  get importLocalType() {
    return this.receivedPoForm.get('importLocalType');
  }

  getMetricCost(productPackage) {
    if (!this.isSelfProduct(productPackage.get('productDetails').value)) {
      return '';
    }
    return (
      productPackage.get('metricCost').value?.attributeValue?.toFixed(3) +
      ' ' +
      productPackage.get('metricCost').value?.userConversionUom
    );
  }

  get status() {
    return this.receivedPoForm.get('status');
  }

  addProductPackage() {
    const status = this.status.value;
    if (status == 'CONFIRMED' || status == 'REJECTED') {
      return;
    }
    const productPackageForm = this.orderFormsService.productPackageForm();
    this.productPackages.push(productPackageForm);
  }

  deleteProductPackage(i: any) {
    const status = this.status.value;
    if (status == 'CONFIRMED' || status == 'REJECTED') {
      return;
    }
    this.productPackages.removeAt(i);
    this.calculateValues();
  }

  get isEditable() {
    return this.route.snapshot.params.id ? true : false;
  }

  get isEditableCost() {
    return (
      this.status.value != 'CONFIRMED' &&
      this.status.value != 'REJECTED' &&
      !this.receivedPoForm.get('isQuickCheckout').value
    );
  }

  getProductsList = (() => {
    const subject = new Subject<any>();
    subject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((event: any) => {
        let productSearchRequest: any = {};

        const uomQuery = this.getUomQuery();
        productSearchRequest.searchString = event.target.value;
        productSearchRequest.uomQuery = uomQuery;
        productSearchRequest.published = true;
        productSearchRequest.businessAccountId = this.customerId.value;
        productSearchRequest.loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId;
        this.orderManagementService
          .Get_ALL_Products_List_For_ReceivedPurchaseOrder(productSearchRequest)
          .subscribe((res) => {
            this.productsList = res?.content;
          });
      });
    return (event: any) => subject.next(event);
  })();

  get customerId() {
    return this.receivedPoForm.get('requestFrom').get('id');
  }
  get buyingType() {
    return this.receivedPoForm.get('buyingType');
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
    productPackage
      .get('productDetails')
      .get('productMetaBusinessAccountId')
      .patchValue(item?.productMetaBusinessAccountId);
    productPackage
      .get('productDetails')
      .get('productBusinessAccountId')
      .patchValue(item?.productBusinessAccountId);
    this.calculateValues();
  }

  changeQuantityInOrder(i) {
    if (!this.isEditableCost) {
      this.toastr.warning('You are not allowed to update quantity');
      return;
    }
    const quantityControl = this.productPackages.controls[i].get('quantity');
    quantityControl.patchValue(quantityControl.value);
    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    this.receivedPoForm.get('isUpdated').setValue(true);
    this.calculateValues();
  }
  updateProductQuantityInOrder(i, quantity) {

    if (!this.isEditableCost) {
      this.toastr.warning('You are not allowed to update quantity');
      return;
    }

    const quantityControl = this.productPackages.controls[i].get('quantity');

    quantityControl.patchValue(quantityControl.value + quantity);
    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    this.receivedPoForm.get('isUpdated').setValue(true);
    this.calculateValues();
  }

  changeCostByUser(productPackageForm) {
    productPackageForm.get('isCostInputByUser').patchValue(true);
    this.receivedPoForm.get('isUpdated').setValue(true);
    this.calculateValues();
  }

  get noteId() {
    return this.receivedPoForm.get('noteTemplate').get('id');
  }

  getNoteTitle() {
    const item = this.businessAccountService.notesList.find(
      (item) => item.id == this.noteId.value
    );
    return item?.description ?? '';
  }

  // file related

  get media_url_ids() {
    return this.receivedPoForm.get('media_url_ids');
  }
  get media_urls() {
    return this.receivedPoForm.get('media_urls');
  }
  poFile: any = null;

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

  uploadFiles(files: any, fileinput: HTMLInputElement) {
    this.apiService.uploadFiles(files).then(
      (res: any) => {
        const resp: any = res;
        const media_url_ids: any[] = [];
        resp.data.forEach((element) => {
          media_url_ids.push(element.id);
        });
        const oldmediaurlids = this.media_url_ids.value ?? [];
        const oldmediaurls = this.media_urls.value ?? [];
        const media_url_merge_ids = [...oldmediaurlids, ...media_url_ids];
        const media_urls = [...oldmediaurls, ...resp.data];
        this.media_urls.patchValue(media_urls);
        this.media_url_ids.patchValue(media_url_merge_ids);
        fileinput.value = ''; // Clear the file input after selection
      },
      (err) => {
        fileinput.value = ''; // Clear the file input after selection
      }
    );
  }

  deleteFile(file, i) {
    const oldmediaurls = this.media_urls.value ?? [];
    this.apiService.deleteFiles(file).then((res: any) => {
      oldmediaurls.splice(i, 1);
      this.media_urls.patchValue(oldmediaurls);
    });
  }

  showIsCustomizedandClonableProduct(product: any) {
    if (
      product?.isCustomized &&
      product?.productDetails?.preferredCustomerId != this.customerId?.value
    ) {
      return true;
    } else {
      return false;
    }
  }

  viewCustomizedDetail(productPackage, i) {
    this.apiService.Get_All_Attributes();
    const receivedPoForm =
      this.orderFormsService.createReceivedPurchaseOrderForm();
    receivedPoForm.patchValue(this.receivedPoForm.getRawValue());
    const dialogRef = this.dialog.open(QcProductDetailComponent, {
      data: {
        productData: productPackage,
        orderForm: receivedPoForm,
        productIndex: i,
        hideAddToOrder: true,
        isSelfProduct: false,
        customisationOption: true,
        rating: this.getRating(
          productPackage?.value?.productDetails.productCode
        ),
      },
      panelClass: 'qc-detail-dialog',
    });
  }

  private hashCode(element: any): number {
    let str = JSON.stringify(element);
    let hash = 0,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash); // Ensure positive value
  }

  getRating(value: any): string {
    // Step 1: Convert the element to a unique number
    const uniqueNumber = this.hashCode(value);

    // Step 2: Normalize the unique number to a value between 0 and 1
    const normalizedValue = (uniqueNumber % 1000000) / 1000000.0;

    // Step 3: Scale the value to be between 4 and 5
    const rating = 4 + normalizedValue;

    // Step 4: Format the rating to one digit after the decimal
    const formattedRating = rating.toFixed(1);

    return formattedRating;
  }

  poSelected(event) {
    if (this.receivedPoForm.value.status != 'DRAFT') {
      return;
    }
    this.generatePoFromPdf(event.target.files[0]);
  }
  onPaste(event) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            this.generatePoFromPdf(pastedFile);
          }
        }
      }
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
      const data = await this.orderManagementService
        .generatePoFromPdf(formData, null)
        .toPromise();
      if (data.status == 'FAILED') {
        this.toastr.warning(data?.error);
      }
      this.poFile = file;
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

  viewFile(orderFile: any) {
    const item = this.media_urls.value.find((obj) =>
      obj.media_url.includes(orderFile?.name)
    );
    if (item) {
      window.open(environment.imgUrl + item.media_url, '_blank');
    }
  }

  onChangeDeliveryCost() {
    this.receivedPoForm.get('deliveryCostInputByUser').patchValue(true);
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

  printPdf() {
    this.generatePdf.emit();
  }

  // end
}
