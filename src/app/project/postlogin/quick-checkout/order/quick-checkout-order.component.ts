import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  Subscription,
  debounceTime,
  first,
  switchMap,
  takeUntil,
  finalize,
} from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { TokenService } from 'src/app/service/token.service';
import { BuddyDialogComponent } from 'src/app/shared/component/buddy-dialog/buddy-dialog.component';
import { environment } from 'src/environments/environment';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { AuthService } from 'src/app/service/auth.service';
import { ContainerManagementService } from '../../container-management/service/container-management.service';
import { QuickCheckoutFormsService } from '../services/quickcheckout-forms.service';
import { RateDialogComponent } from 'src/app/shared/dialogs/rate-dialog/rate-dialog.component';
import { BusinessAccountService } from '../../business-account/business-account.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { QcProductDetailComponent } from '../qc-product-detail/qc-product-detail.component';
import { PaymentService } from 'src/app/service/payment.service';
import { SwiperOptions } from 'swiper';
import { TermsDialogComponent } from 'src/app/shared/dialogs/terms/terms-dialog.component';
import { Location, NgStyle, NgClass, TitleCasePipe, DatePipe, AsyncPipe } from '@angular/common';
import { NumberFormatterPipe } from '../../../../shared/pipes/number-formatter.pipe';
import { PaymentComponent } from '../../order-management/vendor-modules/purchaseorder/purchaseorder-steps/payment/payment.component';
import { GridViewProductCardComponent } from './grid-view-product-card/grid-view-product-card.component';
import { SwiperModule } from 'swiper/angular';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { DadyinSelectComponent } from '../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinMapAutoCompleteComponent } from '../../../../shared/widgets/dadyin-map-autocomplete/dadyin-map-autocomplete.component';
import { DadyinSearchableSelectComponent } from '../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { DadyinTabComponent } from '../../../../shared/widgets/dadyin-tab/dadyin-tab.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatTooltip } from '@angular/material/tooltip';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';

@Component({
    selector: 'app-quick-checkout-order',
    templateUrl: './quick-checkout-order.html',
    styleUrls: ['./quick-checkout-order.scss'],
    standalone: true,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    ExtendedModule,
    MatTooltip,
    RouterLink,
    DadyinButtonComponent,
    CdkDrag,
    DadyinTabComponent,
    DadyinSearchableSelectComponent,
    NgClass,
    DadyinMapAutoCompleteComponent,
    DadyinSelectComponent,
    NgbTooltip,
    MatIcon,
    SwiperModule,
    GridViewProductCardComponent,
    PaymentComponent,
    TitleCasePipe,
    DatePipe,
    NumberFormatterPipe
],
})
export class QuickCheckoutOrderComponent implements OnInit, OnDestroy {
  cartView = false;
  htmlContent: any;
  allTierPricingDetails: any;
  private destroy$ = new Subject<void>();

  swiperConfig: SwiperOptions = {
    spaceBetween: 10,
    navigation: false,
    breakpoints: {
      0: { slidesPerView: 1.2, spaceBetween: 10 },
      720: { slidesPerView: 1.2, spaceBetween: 10 },
    },
  };

  public imgUrl = environment.imgUrl;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }
  viewType = 'normal';
  showPayNowButton = false;
  uomSetting = false;
  public orderForm = this.quickCheckoutFormService.createPOForm();
  public categories: any[];
  public selectedCategoryId: any = null;
  public isExpand: boolean = false;
  public productsList: any[] = [];
  selectedVendorDetail = null;
  public toggle: boolean = false;
  public buyingTypeListLocal: any[] = [
    { name: 'SKU Buyers', value: 'SKU' },
    { name: 'Pallet Buyers', value: 'PALLET' },
  ];
  public buyingTypeListContainer: any[] = [
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];

  currentMainIndex: number = 0;
  public selectedPaymentMethod = 'CARD';
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();

  public productSearchRequest: any = {};
  productsListDetails: any;
  ownershipTag: any = null;
  minRequiredDate: any = new Date().toISOString().split('T')[0];
  private isCalculating = false;
  currentBusinessAccountDetail: any = null;
  searchSubject = new Subject();
  public singleProductDataForm: UntypedFormGroup = this.quickCheckoutFormService.productPackageForm();
  public singleProductDataIndex = 0;
  paymentOverview: any[] = [];
  businessAccountSubscription: Subscription;
  vendorListSubscription: Subscription;
  productTypeList: any[] = [];

  private readonly vendorKeyToIdMap: Record<string, number> = {
    dayana: 301,
    skventure: 4513,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    private apiService: ApiService,
    private tokenService: TokenService,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public formsService: FormsService,
    public quickCheckoutFormService: QuickCheckoutFormsService,
    public uomService: UomService,
    private authService: AuthService,
    private containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public paymentService: PaymentService,
    public location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  mainTab: Array<any> = [
    { id: 1, name: 'Order Details', index: 0 },
    { id: 2, name: 'Pay now', index: 1 },
  ];

  @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;

  async ngOnInit() {
    if (this.route.snapshot.queryParams.productKey && !this.productSearchRequest.searchString) {
      let productSearchText = null;
      if (this.route.snapshot.queryParams.productKey == 'jutebags') {
        productSearchText = 'JTB-14BN15-SMPL';
      } else if (this.route.snapshot.queryParams.productKey == 'cottonbags') {
        productSearchText = 'CTB-15WT15';
      } else if (this.route.snapshot.queryParams.productKey == 'paperbags') {
        productSearchText = 'PBW-11BB6';
      } else if (this.route.snapshot.queryParams.productKey == 'tshirtbag') {
        productSearchText = 'tshirtbag';
      } else {
        const productKey = this.route.snapshot.queryParams.productKey.split(':')[0];
        productSearchText = productKey;
      }
      this.productSearchRequest.searchString = productSearchText;
    }

    this.businessAccountService.Get_All_Vendors();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_IncoTerms();
    this.apiService.Get_All_Attributes();
    this.apiService.Get_All_AttributeTypes();

    if (this.route.snapshot.queryParams.currentMainIndex == '1') {
      this.currentMainIndex = 1;
    }

    this.businessAccountSubscription = this.businessAccountService.$currentBusinessAccount
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.portId) {
          this.orderForm.get('arrivalPortId').patchValue(res?.portId);
        }
        this.currentBusinessAccountDetail = res;
      });

    this.loadProductsListRequest();

    this.vendorListSubscription = this.businessAccountService.vendorListLoaded
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (!res) return;

        const vendorIdFromParams = this.resolveVendorIdFromQueryParams();

        if (this.businessAccountService.vendorList.length == 0) {
          this.vendorId.patchValue(vendorIdFromParams || this.businessAccountService.vendorId);
          this.cdr.detectChanges();
          this.getVendorDetail(this.vendorId.value);
        } else {
          if (vendorIdFromParams) {
            this.vendorId.setValue(vendorIdFromParams);
            this.cdr.detectChanges();
            this.getVendorDetail(this.vendorId.value);
          } else {
            this.vendorId.patchValue(this.businessAccountService.vendorList[0].relationAccountId);
            this.cdr.detectChanges();
            this.getVendorDetail(this.vendorId.value);
          }
        }

        this.productSearchRequest.productTypeIds = this.route.snapshot.queryParams.productTypeId ? [this.route.snapshot.queryParams.productTypeId] : [];
        this.productSearchRequest.productCategoryId = this.route.snapshot.queryParams.productCategoryId;
        this.productSearchRequest.subProductIds = null;
        this.productSearchRequest.isSaleable = true;
        this.productSearchRequest.pageIndex = 0;
        this.productSearchRequest.pageS = 20;
        this.productSearchRequest.sortQuery = 'productTypeId,productCode,audit.businessAccount.id';
        this.productSearchRequest.specificVendor = this.vendorId.value;
        this.productSearchRequest.buyingCapacityType = null;
        this.productSearchRequest.ownershipFilter = '&filter=(audit.businessAccount.id:' + this.vendorId.value + ' or (audit.businessAccount.id:' + (this.businessAccountService.currentBusinessAccountId || 9999) + ' and vendorProductBusinessId:' + this.vendorId.value + '))';
        this.productSearchRequest.isCustomizable = null;

        if (this.route.snapshot.queryParams.category == 'pharmacy') {
          this.productSearchRequest.productCategoryId = 56;
        }
        if (this.route.snapshot.queryParams.category == 'liquorbags') {
          this.productSearchRequest.productCategoryId = 5;
        }

        if (this.route.snapshot.queryParams.viewType || this.route.snapshot.queryParams.productKey) {
          this.viewType = this.route.snapshot.queryParams.viewType ?? 'flyer';
          if (this.viewType != 'normal') {
            this.toggle = false;
          }
        }
        if (vendorIdFromParams) {
          this.productSearchRequest.ownershipFilter = `&filter=(audit.businessAccount.id:${vendorIdFromParams} or (audit.businessAccount.id:${(this.businessAccountService.currentBusinessAccountId || 9999)} and vendorProductBusinessId:${vendorIdFromParams}))`;
        }
        if (this.route.snapshot.queryParams.searchString) {
          this.productSearchRequest.searchString = this.route.snapshot.queryParams.searchString;
        }
        this.search();
        this.getPreference();
      });

    if (this.route.snapshot.queryParams.buyingType) {
      this.buyingType.patchValue(this.route.snapshot.queryParams.buyingType);
    }
    if (this.route.snapshot.params['id']) {
      this.getOrderById();
    } else {
      this.orderForm.get('requestFrom').get('id').patchValue(this.tokenService.getBusinessAccountIdToken());
    }
    this.paymentStatus.valueChanges.subscribe((res) => {
      if (res == 'COMPLETED') {
        this.mainTab[1].name = 'PAYMENT DETAILS';
      } else {
        this.mainTab[1].name = 'PAY NOW';
      }
    });

    const currentDate = new Date();
    this.orderForm.get('date').patchValue(currentDate.toISOString().split('T')[0]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProductTypesByVendorId(vendorId) {
    this.purchaseOrderService.getProductTypesByVendor(vendorId).pipe(first()).subscribe(
      (res: any) => { this.productTypeList = res; },
      (err) => { this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); }
    );
  }

  getFilteredProductTypeListByCategoryId(): any[] {
    if (this.businessAccountService.currentbusinessLines?.includes('RETAILER')) {
      if (this.selectedCategoryId == null || this.selectedCategoryId == 'null') {
        const productTypesInCategories = (this.categories || []).flatMap((category: any) => category.categoryProductTypes || []).map((productType: any) => productType.productTypeId);
        return this.productTypeList.filter((it: any) => productTypesInCategories.includes(it.id));
      } else {
        const category = (this.categories || []).find((it: any) => Number(it.id) == Number(this.selectedCategoryId));
        if (category) {
          const productTypesInCategory = category.categoryProductTypes.map((it: any) => it.productTypeId);
          return this.productTypeList.filter((it: any) => productTypesInCategory?.includes(it.id));
        } else {
          return this.productTypeList;
        }
      }
    } else {
      return this.productTypeList;
    }
  }

  getOrderById() {
    this.purchaseOrderService.Get_Order(this.route.snapshot.params['id']).pipe(first()).subscribe(
      (orderResponse: any) => {
        orderResponse.isReceiving = false;
        if (orderResponse?.status == 'CONFIRMED') {
          this.patchOrder(orderResponse);
        } else {
          this.calculateOrderDetail(orderResponse);
        }
      },
      (err) => {
        if (err?.status === 404) {
          this.toastr.warning('Transaction Not Found');
          this.onBackToOrders();
        }
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    );
  }

  patchOrder(orderResponse: any) {
    this.productPackages.clear();
    orderResponse.productPackages.forEach((ele) => {
      const productPackageForm = this.quickCheckoutFormService.productPackageForm();
      const packageCustomAttributeValues = productPackageForm.get('packageCustomAttributeValues') as UntypedFormArray;
      ele.packageCustomAttributeValues.forEach((packagecustom) => {
        const packageForm = this.formsService.createPackageAttributeForm();
        packageForm.patchValue(packagecustom);
        packageCustomAttributeValues.push(packageForm);
      });
      productPackageForm.patchValue(ele);
      this.productPackages.push(productPackageForm);
    });
    this.orderForm.patchValue(orderResponse);
  }

  get orderId() { return this.orderForm.value.id; }
  get paymentStatus() { return this.orderForm.get('paymentStatus'); }
  get status() { return this.orderForm.get('status'); }
  getPreference() {
    this.apiService.getPreferredUoms().subscribe(
      (preference: any) => {
        const preferenceForContainer = preference.find((item) => item.componentType == 'ORDER');
        this.componentUoms.clear();
        preferenceForContainer?.componentUoms?.forEach((ele) => {
          const componentUomForm = this.formsService.createComponentUomForm();
          this.componentUoms.push(componentUomForm);
        });
        this.preferForm.patchValue(preferenceForContainer);
        if (this.categories?.length > 0 && (this.currentBusinessAccountDetail?.businessLines?.includes('RETAILER') || this.currentBusinessAccountDetail?.businessLines?.includes('DISTRIBUTOR'))) {
          return;
        }
        this.loadProductsList();
      },
      (err) => { this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); }
    );
  }

  get componentUoms() { return this.preferForm.get('componentUoms') as UntypedFormArray; }
  get productPackages() { return this.orderForm.get('productPackages') as UntypedFormArray; }
  get importLocalType() { return this.orderForm.get('importLocalType'); }
  get buyingType() { return this.orderForm.get('buyingType'); }

  toggleType(value: any) {
    if (this.productPackages?.controls?.length > 0 || this.businessAccountService.currentbusinessLines?.includes('RETAILER')) return;
    if (value == 'LOCAL') { this.buyingType.patchValue('SKU'); } else { this.buyingType.patchValue('CONTAINER_40_FT_HQ'); }
    this.importLocalType.patchValue(value);
    this.onChangeBuyingType();
  }

  inviteFriend() { this.dialog.open(BuddyDialogComponent, { data: this.orderForm.getRawValue() }); }
  toggleView() { this.toggle = !this.toggle; }
  openRating(rating: any, product: any) {
    this.dialog.open(RateDialogComponent, { data: { rating: rating } }).afterClosed().subscribe(
      (res) => { if (res) this.rateProduct(res, product); },
      (err) => { this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); }
    );
  }

  scrollLeft() { this.widgetsContent.nativeElement.scrollLeft -= 50; }
  scrollRight() { this.widgetsContent.nativeElement.scrollLeft += 50; }

  productSearchTrigger$ = new Subject();

  loadProductsList(keepLastResult = false): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery = uomQuery + `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.productSearchRequest.uomQuery = uomQuery;
    if (this.vendorId.value) this.productSearchRequest.specificVendor = this.vendorId.value;
    this.productSearchRequest.buyingCapacityType = this.buyingType.value;
    this.productSearchRequest.preferredCustomerId = this.businessAccountService.currentBusinessAccountId;

    this.productSearchTrigger$.next({ searchRequest: this.productSearchRequest, keepLastResult: keepLastResult });
  }

  loadProductsListRequest() {
    this.productSearchTrigger$.pipe(
      takeUntil(this.destroy$),
      switchMap((res: any) => this.purchaseOrderService.Get_ALL_Product_List(res.searchRequest))
    ).subscribe(
      (products: any) => {
        this.productsList = [];
        this.productsListDetails = products;
        this.productsList = products?.content ?? [];
        const productIds = [];
        this.productsList.forEach((product) => { if (product?.isCustomizable) productIds.push(product.id); });
        if (productIds?.length > 0) {
          this.getProductsTierPricingDetailByVendor(productIds.join(','));
        } else {
          this.calculateProductsCostingDetail(false);
        }
      },
      (err) => { console.log(err); this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); }
    );
  }

  downloadProducts(): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery = uomQuery + `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.productSearchRequest.uomQuery = uomQuery;
    if (this.vendorId.value) this.productSearchRequest.specificVendor = this.vendorId.value;
    this.productSearchRequest.buyingCapacityType = this.buyingType.value;
    if (this.businessAccountService.currentbusinessLines?.includes('RETAILER')) {
      if (this.selectedCategoryId == null || this.selectedCategoryId == 'null') {
        const categoryIds = this.categories.map((it) => it.id);
        this.productSearchRequest.productCategoryId = categoryIds.join(',');
      } else {
        this.productSearchRequest.productCategoryId = this.selectedCategoryId;
      }
    }
    this.purchaseOrderService.downloadProductsPdf(this.productSearchRequest).subscribe((res) => {
      this.htmlContent = res;
      this.printHTML(this.orderForm.get('transactionId').value);
    });
  }

  printHTML(transactionId: any) {
    const originalTitle = document.title;
    document.title = transactionId;
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.position = 'absolute'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = 'none';
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open(); doc.write(`${this.htmlContent}`); doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus(); iframe.contentWindow?.print();
        document.body.removeChild(iframe); document.title = originalTitle;
      }, 100);
    }
  }

  onSelectCategory() {
    if (this.selectedCategoryId == null || this.selectedCategoryId == 'null') {
      const categoryIds = this.categories.map((it) => it.id);
      this.productSearchRequest.productCategoryId = categoryIds.join(',');
    } else if (this.selectedCategoryId == 'none') {
      this.productSearchRequest.productCategoryId = null;
    } else {
      this.productSearchRequest.productCategoryId = this.selectedCategoryId;
    }
    this.productSearchRequest.productTypeIds = [];
    this.loadProductsList();
  }

  expand() { this.isExpand = !this.isExpand; }
  filterFav(flag: boolean) { this.productSearchRequest.isFavourite = flag; this.loadProductsList(); }
  filterCustomizable(flag: boolean) { this.productSearchRequest.isCustomizable = flag; this.loadProductsList(); }
  searchByProductType(productTypeId) {
    if (productTypeId == null) { this.productSearchRequest.productTypeIds = []; this.loadProductsList(); return; }
    if (this.productSearchRequest.productTypeIds?.includes(productTypeId)) {
      const ind = this.productSearchRequest.productTypeIds.findIndex((item) => item == productTypeId);
      this.productSearchRequest.productTypeIds.splice(ind, 1);
    } else {
      this.productSearchRequest.productTypeIds.push(productTypeId);
    }
    this.loadProductsList();
  }

  searchByString(event: any) {
    this.productSearchRequest.searchString = event?.target?.value;
    this.searchSubject.next(this.productSearchRequest.searchString);
  }

  search() {
    this.searchSubject.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe((value) => {
      this.loadProductsList(true);
    });
  }

  clearSearch() {
    this.productSearchRequest.productCategoryId = null;
    this.productSearchRequest.searchString = null;
    this.loadProductsList();
  }

  clearProductTypes() {
    this.productSearchRequest.productTypeIds = [];
    this.loadProductsList();
  }

  isNoGenericPurchase(product: any) { return product.productDetails?.isNoGenericPurchase == true; }

  addProductToOrder(product: any) {
    if (product.isCustomized) this.deliveryPickup.setValue('DELIVERY');
    if (!product?.quantity || product?.quantity < 1) { this.toastr.warning('Please add atleast 1 in quantity !'); return; }
    let existingProductIndex = this.productPackages.value.findIndex((itm) => itm.productId == product.productDetails.id);
    if (existingProductIndex != -1) this.productPackages.removeAt(existingProductIndex);
    const productpackageForm = this.quickCheckoutFormService.productPackageForm();
    const packageCustomAttributeValues = productpackageForm.get('packageCustomAttributeValues') as UntypedFormArray;
    product?.packageCustomAttributeValues?.forEach((element) => { packageCustomAttributeValues.push(this.formsService.createAttributeForm()); });
    productpackageForm.patchValue(product);
    productpackageForm.get('productDetails').patchValue(product?.productDetails);
    productpackageForm.get('id').patchValue(null);
    productpackageForm.get('productId').patchValue(product.productDetails?.id);
    productpackageForm.get('packageId').patchValue(product.productDetails?.skuPackageId);
    this.productPackages.push(productpackageForm);
    this.calculateOrderDetail(this.orderForm.getRawValue());
  }

  deleteProductFromOrder(product: any) {
    let existingProductIndex = this.productPackages.value.findIndex((itm) => itm.productId == product.productDetails?.id);
    this.productPackages.removeAt(existingProductIndex);
    this.calculateOrderDetail(this.orderForm.getRawValue());
  }

  checkIfAnyProductIsSelfProduct() {
    const productPackages = this.orderForm.get('productPackages') as UntypedFormArray;
    const loggedInAccountId = this.businessAccountService.currentBusinessAccountId;
    return productPackages?.value.findIndex((productPackage) => productPackage.productDetails?.audit?.businessAccountId == loggedInAccountId) != -1;
  }

  calculateOrderDetail(data: any) {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => { uomQuery = uomQuery + `&uomMap[${col}]=${element.get('userConversionUom').value}`; });
    });
    uomQuery = encodeURI(uomQuery);
    this.purchaseOrderService.Calculate_Order_Values(data, uomQuery).subscribe(
      (updatedOrderDetails) => { this.patchOrder(updatedOrderDetails); this.setMQOQuantity(); },
      (err) => { this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); }
    );
  }

  calculateProductsCostingDetail(change) {
    if (this.isCalculating) {
      return;
    }
    this.isCalculating = true;

    const orderForm = this.quickCheckoutFormService.createPOForm();
    orderForm.get('buyingType').patchValue(this.buyingType.value);
    orderForm.get('status').patchValue(null);
    orderForm.get('deliveryPickup').patchValue(null);
    orderForm.get('requestFrom').get('id').patchValue(Number(this.tokenService.getBusinessAccountIdToken()));
    const productPackages = orderForm.get('productPackages') as UntypedFormArray;
    this.productsList.forEach((ele) => {
      if (!ele.quantity) {
        ele.quantity = ele?.skuThirdMinimumQuantity;
        if (['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value)) {
          ele.quantity = ele?.containerMqo ?? 1;
        } else if (['PALLET']?.includes(this.buyingType?.value)) {
          ele.quantity = ele.palletMqo ?? 1;
        } else if (['TRUCK']?.includes(this.buyingType?.value)) {
          ele.quantity = ele.truckMqo ?? 1;
        }
        if (ele?.isNoGenericPurchase && this.getTierPricingByProduct(ele?.id)) {
          const tier = this.getTierPricingByProduct(ele?.id)[0];
          ele.quantity = tier?.minimumQuantity;
          ele.deliveryDays = tier?.deliveryPricing[1]?.numberOfDays;
          ele.isCustomized = true;
        }
      }
      if (!ele.loadingType) ele.loadingType = 'FLOOR';
      const productPackageForm = this.quickCheckoutFormService.productPackageFormCalculate();
      productPackageForm.patchValue(ele);
      if (!change) productPackageForm.get('productDetails').patchValue(ele);
      productPackageForm.get('quantity').patchValue(ele.quantity);
      productPackages.push(productPackageForm);
    });
    const data = orderForm.getRawValue();
    data.isReceiving = false;
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => { uomQuery = uomQuery + `&uomMap[${col}]=${element.get('userConversionUom').value}`; });
    });
    uomQuery = encodeURI(uomQuery);
    this.purchaseOrderService.Calculate_Order_Values(data, uomQuery)
      .pipe(finalize(() => this.isCalculating = false))
      .subscribe(
        (res: any) => {
          this.productsList = res?.productPackages;
          this.productsList = this.getSortedArray(this.productsList);
          if (!change && this.productSearchRequest.searchString) {
            const productKey = this.route.snapshot.queryParams.productKey;
            let code = null;
            if (productKey == 'jutebags') code = 'JTB-14BN15-SMPL';
            else if (productKey == 'cottonbags') code = 'CTB-15WT15';
            else if (productKey == 'paperbags') code = 'PBW-11BB6';
            else if (productKey == 'tshirtbag') code = 'tshirtbag';
            else if (productKey) code = productKey.split(':')[0];
            
            if (code) {
              const selected = this.productsList.find((p) => p?.productDetails.productCode == code);
              if (selected) this.viewDetail(selected, selected?.productDetails?.isCustomizable);
            }
          }
          this.singleProductDataForm.patchValue(this.productsList[this.singleProductDataIndex]);
        },
        (err) => { this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); }
      );
  }

  getProductsTierPricingDetailByVendor(productIds) {
    this.purchaseOrderService.getProductsTierPricingDetailByVendor(productIds).subscribe((res) => {
      this.allTierPricingDetails = res;
      this.calculateProductsCostingDetail(false);
    });
  }

  getTierPricingByProduct(id) { return this.allTierPricingDetails?.[id] ?? []; }
  isNotAvailableInTopList(product) {
    if (this.viewType == 'flyer') return true;
    return this.productPackages.value.findIndex((itm) => itm.productId == product.id) == -1;
  }
  showHideButtonLabel(product) { return this.productPackages.value.findIndex((itm) => itm.productId == product.id) != -1; }

  setMQOQuantity() {
    this.productsList?.forEach((ele) => {
      if (ele.quantity) return;
      if (['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value)) ele.quantity = ele.productDetails?.containerMqo ?? 1;
      else if (['PALLET']?.includes(this.buyingType?.value)) ele.quantity = ele.productDetails.palletMqo ?? 1;
      else if (['TRUCK']?.includes(this.buyingType?.value)) ele.quantity = ele.productDetails.truckMqo ?? 1;
      else if (['SKU']?.includes(this.buyingType?.value)) ele.quantity = ele.skuThirdMinimumQuantity;
    });
  }

  rateProduct(rating: any, product) {
    const data = { productMetaId: product.productDetails?.productMetaId, rating, isFavourite: null, ratingType: 'RATING' };
    this.purchaseOrderService.rate_product(data).subscribe(() => this.toastr.success('Successfully Rated'), (err) => this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'));
  }
  markFavProduct(product) {
    const data = { productMetaId: product.productDetails?.productMetaId, rating: null, isFavourite: !product.productDetails?.isFavourite, ratingType: 'FAVOURITE' };
    this.purchaseOrderService.rate_product(data).subscribe(() => { this.toastr.success('Successfully Updated'); this.loadProductsList(); }, (err) => this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'));
  }

  onBackToOrders() { this.router.navigateByUrl('/home/quick-checkout'); }

  loadCategories() {
    this.purchaseOrderService.Get_Product_Categories_Mapped(this.vendorId.value).subscribe(
      (categoryList) => {
        this.categories = categoryList;
        if (this.categories?.length > 0 && (this.currentBusinessAccountDetail?.businessLines?.includes('RETAILER') || this.currentBusinessAccountDetail?.businessLines?.includes('DISTRIBUTOR'))) {
          this.onSelectCategory();
        }
      },
      (error) => { this.toastr.error('Something went wrong, please contact DADYIN.'); }
    );
  }

  actions(event) { this.currentMainIndex = event.index; }

  saveDraftOrder() {
    this.orderForm.get('isQuickCheckout').patchValue(true);
    this.purchaseOrderService.Post_Order(this.orderForm.getRawValue()).subscribe(() => { this.toastr.success('Successfully Saved in Draft'); this.onBackToOrders(); }, (err) => this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'));
  }

  placeOrder() {
    this.orderForm.get('isQuickCheckout').patchValue(true);
    const statusp = this.orderForm.get('status').value;
    this.orderForm.get('status').patchValue('PLACED');
    this.purchaseOrderService.Post_Order(this.orderForm.getRawValue()).subscribe((data) => { this.currentMainIndex = 1; this.patchOrder(data); this.toastr.success('Successfully Placed Order'); }, (err) => { this.orderForm.get('status').patchValue(statusp); this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); });
  }

  saveOrder() {
    const statusp = this.orderForm.get('status').value;
    this.purchaseOrderService.Post_Order(this.orderForm.getRawValue()).subscribe((data) => { this.currentMainIndex = 1; this.patchOrder(data); this.toastr.success('Successfully Placed Order'); }, (err) => { this.orderForm.get('status').patchValue(statusp); this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred'); });
  }

  deleteOrder() { this.purchaseOrderService.Delete_Order(this.orderId).subscribe(() => { this.toastr.success('Order Deleted succesfully.'); this.onBackToOrders(); }, (err) => this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred')); }

  minus(index: number) {
    const p = this.productsList[index];
    if (['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value) && p.quantity - 1 < p.productDetails?.containerMqo) {
      this.toastr.warning("Quantity Can't be Less than Container MQO " + p.productDetails?.containerMqo); return;
    }
    const tier = this.getTierPricingByProduct(p?.id)[0];
    if (tier?.minimumQuantity && p?.isCustomized && p.quantity - 1 < tier?.minimumQuantity) {
      this.toastr.warning("Quantity Can't be Less than MQO " + tier?.minimumQuantity); return;
    }
    if (p.quantity < 2) { this.toastr.warning("Quantity Can't go below 1"); return; }
    p.quantity--; this.calculateProductsCostingDetail(true);
  }

  plus(index: number) { this.productsList[index].quantity++; this.calculateProductsCostingDetail(true); }

  getUomByName(type: any) { return this.componentUoms.getRawValue().find((item) => item.attributeName?.toUpperCase() == type?.toUpperCase())?.userConversionUom; }

  changePage(way: any) {
    if (this.productsListDetails?.totalElements < this.productsListDetails?.numberOfElements || this.productsListDetails?.totalElements == 0) return;
    if (way == 'prev' && this.productSearchRequest.pageIndex > 0) { this.productSearchRequest.pageIndex--; this.loadProductsList(); }
    if (way == 'next' && this.productSearchRequest.pageIndex + 1 < this.productsListDetails.totalPages) { this.productSearchRequest.pageIndex++; this.loadProductsList(); }
  }

  changeQuantity(event: any, i, checkForMqo: any = true, data: any = null) {
    const p = this.productsList[i];
    if (checkForMqo && ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value) && event.target.value < p.productDetails?.containerMqo) {
      this.toastr.warning("Quantity Can't be Less than Container MQO " + p.productDetails?.containerMqo); return;
    }
    const tier = this.getTierPricingByProduct(p?.id)[0];
    if (tier?.minimumQuantity && p?.isCustomized && p.quantity < tier?.minimumQuantity) {
      if (data?.minus) { data.productForm.get('skuQuantities').patchValue(p.quantity + 1); p.quantity++; }
      this.toastr.warning("Quantity Can't be Less than MQO " + tier?.minimumQuantity); return;
    }
    if (event.target.value < 1) p.quantity = 1;
    this.calculateProductsCostingDetail(true);
  }

  changeQuantityInOrder(i) {
    const productControl = this.productPackages.controls[i];
    const quantityControl = productControl.get('quantity');
    if (quantityControl.value < 1) { quantityControl.patchValue(1); return; }
    if (['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value) && quantityControl.value < productControl.value.productDetails?.containerMqo) {
      this.toastr.warning("Quantity Can't be Less than Container MQO " + productControl.value.productDetails?.containerMqo);
      quantityControl.patchValue(productControl.value.productDetails?.containerMqo); return;
    }
    this.calculateOrderDetail(this.orderForm.getRawValue());
  }

  updateProductQuantityInOrder(i, quantity) {
    const control = this.productPackages.controls[i];
    const quantityControl = control.get('quantity');
    if (quantityControl.value + quantity < 1) { quantityControl.patchValue(1); return; }
    quantityControl.patchValue(quantityControl.value + quantity);
    if (['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(this.buyingType?.value) && quantityControl.value < control.value.productDetails?.containerMqo) {
      this.toastr.warning("Quantity Can't be Less than Container MQO " + control.value.productDetails?.containerMqo);
      quantityControl.patchValue(control.value.productDetails?.containerMqo); return;
    }
    this.calculateOrderDetail(this.orderForm.getRawValue());
  }

  onChangeBuyingType() {
    this.productSearchRequest.buyingCapacityType = null;
    const vendorIdFromParams = this.resolveVendorIdFromQueryParams();
    const vId = vendorIdFromParams || this.businessAccountService.vendorId;
    this.vendorId.patchValue(vId);
    this.productSearchRequest.specificVendor = vId;
    this.getVendorDetail(vId);
    this.loadProductsList();
  }

  getOwner(audit: any) {
    const loggedInAccountId = this.businessAccountService.currentBusinessAccountId;
    if (!loggedInAccountId) return '';
    if (audit?.businessAccountId == 1) return 'M';
    if (audit?.businessAccountId == loggedInAccountId) return 'S';
    return 'T';
  }

  isSelfProduct(productDetails: any) { return productDetails?.audit?.businessAccountId == this.businessAccountService.currentBusinessAccountId; }
  isMyProduct(productDetails: any) { return !!(this.businessAccountService.currentBusinessAccountId && productDetails?.preferredCustomerId); }

  hideAddToOrder(audit: any) { return !(audit?.businessAccountId == this.vendorId.value || this.getOwner(audit) == 'S'); }
  get vendorId() { return this.orderForm.get('requestTo').get('id'); }

  filterProductByOwnership(ownership: any) {
    if (this.ownershipTag == ownership) {
      this.ownershipTag = null;
      this.productSearchRequest.ownershipFilter = '&filter=(audit.businessAccount.id:' + this.vendorId.value + ' or (audit.businessAccount.id:' + (this.businessAccountService.currentBusinessAccountId || 9999) + ' and vendorProductBusinessId:' + this.vendorId.value + '))';
      this.loadProductsList();
      return;
    }
    this.ownershipTag = ownership;
    const loggedInAccountId = this.businessAccountService.currentBusinessAccountId;
    let filter = null;
    if (ownership == 'S') filter = '&filter=audit.businessAccount.id:' + loggedInAccountId + ' or audit.businessAccount.id:' + this.vendorId.value;
    if (ownership == 'M') filter = '&filter=audit.businessAccount.id:1 or audit.businessAccount.id:' + this.vendorId.value;
    if (ownership == 'T') filter = '&filter=audit.businessAccount.id!1 and audit.businessAccount.id!' + loggedInAccountId;
    this.productSearchRequest.ownershipFilter = filter;
    this.loadProductsList();
  }

  get isEditable() { return this.orderForm.getRawValue()?.status == 'DRAFT'; }
  get deliveryAddressValue() {
    const addr = this.orderForm.getRawValue().deliveryAddress;
    return addr?.addressLine ? Object.values(addr).join(',') : '';
  }

  onAddressSelection(event: any, control) {
    const address = { addressLine: event.formatted_address, addressCountry: '', addressState: '', addressCity: '', addressZipCode: '' };
    event.address_components.forEach((element) => {
      if (element.types.includes('country')) address.addressCountry = element.long_name;
      if (element.types.includes('administrative_area_level_1')) address.addressState = element.long_name;
      if (element.types.includes('administrative_area_level_3')) address.addressCity = element.long_name;
      if (element.types.includes('postal_code')) address.addressZipCode = element.long_name;
    });
    control.patchValue(address);
  }

  getVendorDetail(id) {
    this.businessAccountService.getBusinessAccountDetail(id).pipe(first()).subscribe((res) => {
      if (this.vendorId.value === id) { this.selectedVendorDetail = res; this.cdr.detectChanges(); }
      if (this.businessAccountService.currentbusinessLines?.includes('RETAILER') && !this.route.snapshot.queryParams.vendorId) this.loadCategories();
      this.getProductTypesByVendorId(this.vendorId.value);
    });
  }

  private resolveVendorIdFromQueryParams(): number | null {
    const qp: any = this.route?.snapshot?.queryParams ?? {};
    const directVendorId = Number(qp.vendorId);
    if (!Number.isNaN(directVendorId) && directVendorId) return directVendorId;
    const vendorKey = (qp.vendorKey ?? '').toString().trim().toLowerCase();
    return vendorKey ? this.vendorKeyToIdMap[vendorKey] ?? null : null;
  }

  getVendorWhatsAppUrl(messageType: 'query' | 'demo' = 'demo'): string {
    const defaultPhone = '16468796854';
    let phoneNumber = defaultPhone;
    let message = messageType === 'query' ? 'Hi,I have a query related to Dadyin platform.' : 'Hi,I want to book a demo for platform';

    if (this.selectedVendorDetail?.primaryContact?.phone?.number) {
      phoneNumber = this.selectedVendorDetail.primaryContact.phone.number.replace(/[^\d+]/g, '');
      const vendorName = this.selectedVendorDetail.name || 'vendor';
      message = messageType === 'query' ? `Hi ${vendorName}, I have a query related to Dadyin platform.` : `Hi ${vendorName}, I want to book a demo for platform`;
    }
    return `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(message)}&type=phone_number`;
  }

  onChangeVendor() {
    const vendor = this.businessAccountService.vendorList.find((v) => v.relationAccountId == this.vendorId.value);
    this.getVendorDetail(this.vendorId.value);
    this.incoTermId.patchValue(vendor?.incoTermId);
    this.departurePortId.patchValue(vendor?.portId);
    if (vendor?.isImportExport) { this.importLocalType.patchValue('CONTAINER'); this.buyingType.patchValue('CONTAINER_40_FT_HQ'); }
    if (vendor?.fulfillmentLimitInDays) {
      const futureDate = new Date(Date.now() + vendor.fulfillmentLimitInDays * 86400000);
      this.orderForm.get('requiredByDate').patchValue(futureDate.toISOString().split('T')[0]);
      this.minRequiredDate = futureDate.toISOString().split('T')[0];
    }
    this.ownershipTag = null;
    this.productSearchRequest.ownershipFilter = '&filter=(audit.businessAccount.id:' + this.vendorId.value + ' or (audit.businessAccount.id:' + (this.businessAccountService.currentBusinessAccountId || 9999) + ' and vendorProductBusinessId:' + this.vendorId.value + '))';
    this.loadProductsList();
  }

  get incoTermId() { return this.orderForm.get('incoTermId'); }
  get departurePortId() { return this.orderForm.get('departurePortId'); }
  get deliveryAddress() { return this.orderForm.get('deliveryAddress'); }
  get deliveryPickup() { return this.orderForm.get('deliveryPickup'); }

  confirmDeleteOrder() { this.dialog.open(ConfirmDialogComponent, { width: '25%' }).afterClosed().subscribe(async (res) => { if (res) this.deleteOrder(); }); }

  viewDetail(product: any, customised) {
    if (!customised && (this.isNoGenericPurchase(product) || product?.isCustomized)) customised = true;
    if (this.hideAddToOrder(product?.productDetails?.audit)) { this.toastr.warning('This Product is not available for currently selected Vendor'); return; }
    this.singleProductDataForm.patchValue(product);
    const index = this.productsList.findIndex((it) => it.productDetails.productCode == product.productDetails.productCode);
    this.singleProductDataIndex = index;
    const dialogRef = this.dialog.open(QcProductDetailComponent, {
      data: {
        productData: this.singleProductDataForm,
        orderForm: this.orderForm,
        hideAddToOrder: this.hideAddToOrder(product?.productDetails?.audit),
        isSelfProduct: this.isSelfProduct(product?.productDetails),
        isMyProduct: this.isMyProduct(product?.productDetails),
        customisationOption: customised,
        rating: this.getRating(product?.productDetails.productCode),
      },
      panelClass: 'qc-detail-dialog',
    });
    dialogRef.componentInstance.addToOrderEvent.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      const productData = this.singleProductDataForm.getRawValue();
      if (res.isCustomizable) productData.isCustomized = true;
      this.addProductToOrder(productData);
    });

    dialogRef.componentInstance.changeQuantityEvent.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.productsList.forEach((ele) => { if (ele.isCustomized == null) ele.isCustomized = false; });
      this.productsList[index] = data.productData;
      this.productsList[index].isCustomized = data.isCustomizable;
      this.productsList[index].quantity = data.event.target.value;
      this.changeQuantity(data.event, index, !data.isCustomizable, data);
    });

    dialogRef.componentInstance.calculateDialogEvent.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.productsList.forEach((ele) => { if (ele.isCustomized == null) ele.isCustomized = false; });
      this.productsList[index] = data.product;
      this.productsList[index].isCustomized = data.customizable;
      this.calculateProductsCostingDetail(true);
    });
  }

  getImageObjectArray(images: any) { return images.map((item: any) => ({ image: item, thumbImage: '', alt: '', title: '' })); }
  currentIndex = 0;
  next(cardLength) { this.currentIndex = (this.currentIndex + 1) % cardLength; }
  prev(cardLength) { this.currentIndex = (this.currentIndex - 1 + cardLength) % cardLength; }
  setQuantity(value, i) { this.productsList[i].quantity = value; this.changeQuantity({ target: { value } }, i); }
  checkout() { this.authService.quickCheckoutData = this.orderForm.getRawValue(); this.router.navigateByUrl('/signin'); }
  get totalSkus() { let q = 0; this.productPackages.value?.forEach((e) => q += e.quantity); return q; }

  getRating(value: any): string {
    const uniqueNumber = this.hashCode(value);
    return (4 + (uniqueNumber % 1000000) / 1000000.0).toFixed(0);
  }

  private hashCode(str: any): number {
    let hash = 0;
    const s = JSON.stringify(str);
    for (let i = 0; i < s.length; i++) { hash = (hash << 5) - hash + s.charCodeAt(i); hash |= 0; }
    return Math.abs(hash);
  }

  get localTimeZone() { return Intl.DateTimeFormat().resolvedOptions().timeZone; }

  confirmPlaceOrder() {
    if (this.productPackages.controls?.length == 0) { this.toastr.warning('Please add products to order'); return; }
    if (this.importLocalType?.value == 'LOCAL' && this.deliveryPickup?.value == 'DELIVERY' && !this.deliveryAddressValue) {
      this.deliveryAddress.get('addressLine').setErrors({ required: true }); this.toastr.warning('Please add delivery Address'); return;
    }
    this.dialog.open(TermsDialogComponent, { panelClass: 'mobile-view-dialog', autoFocus: false }).afterClosed().subscribe(async (res) => { if (res) this.placeOrder(); });
  }

  confirmCheckout() { this.dialog.open(TermsDialogComponent, { panelClass: 'mobile-view-dialog' }).afterClosed().subscribe(async (res) => { if (res) this.checkout(); }); }

  getSortedArray(productsList: any) {
    const priorityProducts = [
      { productCode: 'JTB-14BN15-SMPL', priority: 1 },
      { productCode: 'CTB-15WT15', priority: 2 },
      { productCode: 'PBW-11BB6', priority: 3 },
      { productCode: 'T-6W5915', priority: 4 },
      { productCode: 'RB-19M605', priority: 5 },
      { productCode: 'NWS-17M1442', priority: 6 },
    ];
    if (!Array.isArray(productsList)) return productsList;
    return productsList.sort((a, b) => {
      const pA = priorityProducts.find((p) => p.productCode === a.productDetails?.productCode)?.priority;
      const pB = priorityProducts.find((p) => p.productCode === b.productDetails?.productCode)?.priority;
      if (pA && pB) return pA === pB ? a.productDetails.productTypeId - b.productDetails.productTypeId : pA - pB;
      if (pA) return -1; if (pB) return 1;
      return a.productDetails?.productTypeId - b.productDetails?.productTypeId;
    });
  }

  viewCart() { if (this.viewType == 'flyer') this.cartView = !this.cartView; }
  isDefaultVendor() { return this.vendorId?.value === this.businessAccountService.vendorId; }
  getVendorLogo() {
    if (this.selectedVendorDetail?.businessLogo) return this.imgUrl + this.selectedVendorDetail.businessLogo;
    return '../../../assets/img/business_logo.png';
  }
}
