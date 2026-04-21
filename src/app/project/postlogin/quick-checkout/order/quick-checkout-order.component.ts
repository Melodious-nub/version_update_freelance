import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  Subscription,
  debounceTime,
  first,
  switchMap,
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
import { Location } from '@angular/common';

@Component({
  selector: 'app-quick-checkout-order',
  templateUrl: './quick-checkout-order.html',
  styleUrls: ['./quick-checkout-order.scss'],
})
export class QuickCheckoutOrderComponent implements OnInit {
  cartView = false;
  htmlContent: any;
  allTierPricingDetails: any;


  swiperConfig: SwiperOptions = {
    spaceBetween: 10,
    navigation: false,

    breakpoints: {
      0: {
        slidesPerView: 1.2,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 1.2,
        spaceBetween: 10,
      },
    },
  };

  public imgUrl = environment.imgUrl;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }
  viewType = 'normal';
  // compareProducts = new FormControl(false);
  showPayNowButton = false;
  uomSetting = false;
  public orderForm = this.quickCheckoutFormService.createPOForm();
  public categories: any[];
  public selectedCategoryId: any = null;
  public isExpand: boolean = false;
  public productsList: any[] = [];
  selectedVendorDetail = null;
  // public activeTab: any = { productTypeDescription: 'BOX' };
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
  //pagination for products
  minRequiredDate: any = new Date().toISOString().split('T')[0];
  currentBusinessAccountDetail: any = null;
  searchSubject = new Subject();
  public singleProductDataForm: UntypedFormGroup =
    this.quickCheckoutFormService.productPackageForm();
  public singleProductDataIndex = 0;
  paymentOverview: any[] = [];
  businessAccountSubscription: Subscription;
  vendorListSubscription: Subscription;
  productTypeList: any[] = [];

  /**
   * Map known vendorKeys (marketing URLs) to vendorIds.
   * Example: `?vendorKey=dayana` should behave like `?vendorId=301`.
   */
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
    {
      id: 1,
      name: 'Order Details',
      index: 0,
    },
    {
      id: 2,
      name: 'Pay now',
      index: 1,
    },
  ];

  @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;

  async ngOnInit() {
    if (
      this.route.snapshot.queryParams.productKey &&
      !this.productSearchRequest.searchString
    ) {
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
        const productKey =
          this.route.snapshot.queryParams.productKey.split(':')[0];
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

    this.businessAccountSubscription =
      this.businessAccountService.$currentBusinessAccount.subscribe(
        (res: any) => {
          if (res?.portId) {
            this.orderForm.get('arrivalPortId').patchValue(res?.portId);
          }
          this.currentBusinessAccountDetail = res;
        }
      );

    this.loadProductsListRequest();

    this.vendorListSubscription =
      this.businessAccountService.vendorListLoaded.subscribe((res) => {
        if (!res) {
          return;
        }

        const vendorIdFromParams = this.resolveVendorIdFromQueryParams();

        if (this.businessAccountService.vendorList.length == 0) {
          this.vendorId.patchValue(
            vendorIdFromParams || this.businessAccountService.vendorId
          );
          this.cdr.detectChanges();
          this.getVendorDetail(this.vendorId.value);
        } else {
          if (vendorIdFromParams) {
            this.vendorId.setValue(vendorIdFromParams);
            this.cdr.detectChanges();
            this.getVendorDetail(this.vendorId.value);
          } else {
            this.vendorId.patchValue(
              this.businessAccountService.vendorList[0].relationAccountId
            );
            this.cdr.detectChanges();
            this.getVendorDetail(this.vendorId.value);
          }
        }

        this.productSearchRequest.productTypeIds = this.route.snapshot
          .queryParams.productTypeId
          ? [this.route.snapshot.queryParams.productTypeId]
          : [];
        this.productSearchRequest.productCategoryId =
          this.route.snapshot.queryParams.productCategoryId;
        this.productSearchRequest.subProductIds = null;
        this.productSearchRequest.isSaleable = true;
        this.productSearchRequest.pageIndex = 0;
        this.productSearchRequest.pageS = 20;
        this.productSearchRequest.sortQuery =
          'productTypeId,productCode,audit.businessAccount.id';
        this.productSearchRequest.specificVendor = this.vendorId.value;
        this.productSearchRequest.buyingCapacityType = null;
        this.productSearchRequest.ownershipFilter =
          '&filter=(audit.businessAccount.id:' +
          this.vendorId.value +
          ' or (audit.businessAccount.id:' +
          (this.businessAccountService.currentBusinessAccountId || 9999) +
          ' and vendorProductBusinessId:' +
          this.vendorId.value +
          '))';

        this.productSearchRequest.isCustomizable = null;

        if (this.route.snapshot.queryParams.category == 'pharmacy') {
          this.productSearchRequest.productCategoryId = 56;
        }
        if (this.route.snapshot.queryParams.category == 'liquorbags') {
          this.productSearchRequest.productCategoryId = 5;
        }

        if (
          this.route.snapshot.queryParams.viewType ||
          this.route.snapshot.queryParams.productKey
        ) {
          this.viewType = this.route.snapshot.queryParams.viewType ?? 'flyer';
          if (this.viewType != 'normal') {
            this.toggle = false;
          }
        }
        // Handle vendor configuration using vendorId/vendorKey
        if (vendorIdFromParams) {
          this.productSearchRequest.ownershipFilter = `&filter=(audit.businessAccount.id:${vendorIdFromParams} or (audit.businessAccount.id:${(this.businessAccountService.currentBusinessAccountId || 9999)} and vendorProductBusinessId:${vendorIdFromParams}))`;
        }
        if (this.route.snapshot.queryParams.searchString) {
          this.productSearchRequest.searchString =
            this.route.snapshot.queryParams.searchString;
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
      this.orderForm
        .get('requestFrom')
        .get('id')
        .patchValue(this.tokenService.getBusinessAccountIdToken());
    }
    this.paymentStatus.valueChanges.subscribe((res) => {
      if (res == 'COMPLETED') {
        this.mainTab[1].name = 'PAYMENT DETAILS';
      } else {
        this.mainTab[1].name = 'PAY NOW';
      }
    });

    const currentDate = new Date();
    this.orderForm
      .get('date')
      .patchValue(currentDate.toISOString().split('T')[0]);
  }

  ngOnDestroy() {
    this.businessAccountSubscription.unsubscribe();
    this.vendorListSubscription.unsubscribe();
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.businessAccountService.currentBusinessAccountId = res?.id;
    });
  }

  getProductTypesByVendorId(vendorId) {
    this.purchaseOrderService
      .getProductTypesByVendor(vendorId)
      .pipe(first())
      .subscribe(
        (res: any) => {
          this.productTypeList = res;
        },
        (err) => {
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  getFilteredProductTypeListByCategoryId(): any[] {
    if (
      this.businessAccountService.currentbusinessLines?.includes('RETAILER')
    ) {
      if (
        this.selectedCategoryId == null ||
        this.selectedCategoryId == 'null'
      ) {
        const productTypesInCategories = (this.categories || [])
          .flatMap((category: any) => category.categoryProductTypes || [])
          .map((productType: any) => productType.productTypeId);
        const filteredData = this.productTypeList.filter((it: any) =>
          productTypesInCategories.includes(it.id)
        );
        return filteredData;
      } else {
        const category = (this.categories || []).find(
          (it: any) => Number(it.id) == Number(this.selectedCategoryId)
        );
        let productTypesInCategory = null;
        if (category) {
          productTypesInCategory = category.categoryProductTypes.map(
            (it: any) => it.productTypeId
          );
          const filteredData = this.productTypeList.filter((it: any) =>
            productTypesInCategory?.includes(it.id)
          );
          return filteredData;
        } else {
          return this.productTypeList;
        }
      }
    } else {
      return this.productTypeList;
    }
  }

  getOrderById() {
    this.purchaseOrderService
      .Get_Order(this.route.snapshot.params['id'])
      .pipe(first())
      .subscribe(
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
      const productPackageForm =
        this.quickCheckoutFormService.productPackageForm();
      const packageCustomAttributeValues = productPackageForm.get(
        'packageCustomAttributeValues'
      ) as UntypedFormArray;
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

  get orderId() {
    return this.orderForm.value.id;
  }

  get paymentStatus() {
    return this.orderForm.get('paymentStatus');
  }
  get status() {
    return this.orderForm.get('status');
  }
  getPreference() {
    this.apiService.getPreferredUoms().subscribe(
      (preference: any) => {
        const preferenceForContainer = preference.find(
          (item) => item.componentType == 'ORDER'
        );
        this.componentUoms.clear();
        preferenceForContainer?.componentUoms?.forEach((ele) => {
          const componentUomForm = this.formsService.createComponentUomForm();
          this.componentUoms.push(componentUomForm);
        });
        this.preferForm.patchValue(preferenceForContainer);
        if (
          this.categories?.length > 0 &&
          (this.currentBusinessAccountDetail?.businessLines?.includes(
            'RETAILER'
          ) ||
            this.currentBusinessAccountDetail?.businessLines?.includes(
              'DISTRIBUTOR'
            ))
        ) {
          return;
        }

        this.loadProductsList();
      },
      (err) => {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    );
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  get productPackages() {
    return this.orderForm.get('productPackages') as UntypedFormArray;
  }
  get importLocalType() {
    return this.orderForm.get('importLocalType');
  }

  get buyingType() {
    return this.orderForm.get('buyingType');
  }

  toggleType(value: any) {
    if (
      this.productPackages?.controls?.length > 0 ||
      this.businessAccountService.currentbusinessLines?.includes('RETAILER')
    ) {
      return;
    }
    if (value == 'LOCAL') {
      this.buyingType.patchValue('SKU');
    } else {
      this.buyingType.patchValue('CONTAINER_40_FT_HQ');
    }

    this.importLocalType.patchValue(value);
    this.onChangeBuyingType();
  }

  inviteFriend() {
    this.dialog.open(BuddyDialogComponent, {
      data: this.orderForm.getRawValue(),
    });
  }

  toggleView() {
    if (this.toggle == false) {
      this.toggle = true;
    } else {
      this.toggle = false;
    }
  }

  openRating(rating: any, product: any) {
    this.dialog
      .open(RateDialogComponent, { data: { rating: rating } })
      .afterClosed()
      .subscribe(
        (res) => {
          if (res) {
            this.rateProduct(res, product);
          }
        },
        (err) => {
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  scrollLeft() {
    this.widgetsContent.nativeElement.scrollLeft -= 50;
  }

  scrollRight() {
    this.widgetsContent.nativeElement.scrollLeft += 50;
  }

  productSearchTrigger$ = new Subject();

  loadProductsList(keepLastResult = false): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.productSearchRequest.uomQuery = uomQuery;
    if (this.vendorId.value) {
      this.productSearchRequest.specificVendor = this.vendorId.value;
    }
    this.productSearchRequest.buyingCapacityType = this.buyingType.value;
    this.productSearchRequest.preferredCustomerId =
      this.businessAccountService.currentBusinessAccountId;

    this.productSearchTrigger$.next({
      searchRequest: this.productSearchRequest,
      keepLastResult: keepLastResult,
    }); // Emits the search request
  }

  loadProductsListRequest() {
    this.productSearchTrigger$
      .pipe(
        switchMap((res: any) =>
          this.purchaseOrderService.Get_ALL_Product_List(res.searchRequest)
        )
      )
      .subscribe(
        (products: any) => {
          this.productsList = [];
          this.productsListDetails = products;
          this.productsList = products?.content ?? [];
          const productIds = [];
          this.productsList.forEach((product) => {
            if (product?.isCustomizable) {
              productIds.push(product.id);
            }
          });
          if (productIds?.length > 0) {
            this.getProductsTierPricingDetailByVendor(productIds.join(','));
          } else {
            this.calculateProductsCostingDetail(false);
          }
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  downloadProducts(): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.productSearchRequest.uomQuery = uomQuery;
    if (this.vendorId.value) {
      this.productSearchRequest.specificVendor = this.vendorId.value;
    }
    this.productSearchRequest.buyingCapacityType = this.buyingType.value;
    if (
      this.businessAccountService.currentbusinessLines?.includes('RETAILER')
    ) {
      if (
        this.selectedCategoryId == null ||
        this.selectedCategoryId == 'null'
      ) {
        const categoryIds = this.categories.map((it) => it.id);
        this.productSearchRequest.productCategoryId = categoryIds.join(',');
      } else {
        this.productSearchRequest.productCategoryId = this.selectedCategoryId;
      }
    }

    this.purchaseOrderService
      .downloadProductsPdf(this.productSearchRequest)
      .subscribe((res) => {
        this.htmlContent = res;
        this.printHTML(this.orderForm.get('transactionId').value);
      });
  }

  printHTML(transactionId: any) {
    const originalTitle = document.title;
    document.title = transactionId;

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none'; // Hide the iframe

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      // Write HTML content and custom styles to the iframe
      doc.open();
      doc.write(`
        ${this.htmlContent}
      `);
      doc.close(); // Close document writing

      // Use a delay to ensure content is fully loaded before triggering print
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print(); // Trigger print
        document.body.removeChild(iframe); // Remove the iframe after printing
        document.title = originalTitle; // Restore the original title
      }, 100); // Adjust the delay as needed
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

  expand() {
    this.isExpand = !this.isExpand;
    return;
  }

  filterFav(flag: boolean) {
    this.productSearchRequest.isFavourite = flag;
    this.loadProductsList();
  }

  filterCustomizable(flag: boolean) {
    this.productSearchRequest.isCustomizable = flag;
    this.loadProductsList();
  }

  searchByProductType(productTypeId) {
    if (productTypeId == null) {
      this.productSearchRequest.productTypeIds = [];
      this.loadProductsList();
      return;
    }
    if (this.productSearchRequest.productTypeIds?.includes(productTypeId)) {
      const ind = this.productSearchRequest.productTypeIds.findIndex(
        (item) => item == productTypeId
      );
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
    this.searchSubject.pipe(debounceTime(500)).subscribe((value) => {
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

  isNoGenericPurchase(product: any) {
    return product.productDetails?.isNoGenericPurchase == true ? true : false;
  }

  addProductToOrder(product: any) {
    if (product.isCustomized) {
      this.deliveryPickup.setValue('DELIVERY');
    }

    if (!product?.quantity || product?.quantity < 1) {
      this.toastr.warning('Please add atleast 1 in quantity !');
      return;
    }
    let existingProductIndex = this.productPackages.value.findIndex(
      (itm) => itm.productId == product.productDetails.id
    );
    if (existingProductIndex != -1) {
      this.productPackages.removeAt(existingProductIndex);
    }
    const productpackageForm =
      this.quickCheckoutFormService.productPackageForm();
    const packageCustomAttributeValues = productpackageForm.get(
      'packageCustomAttributeValues'
    ) as UntypedFormArray;
    product?.packageCustomAttributeValues?.forEach((element) => {
      const attributeForm = this.formsService.createAttributeForm();
      packageCustomAttributeValues.push(attributeForm);
    });
    productpackageForm.patchValue(product);
    productpackageForm
      .get('productDetails')
      .patchValue(product?.productDetails);
    productpackageForm.get('id').patchValue(null);
    productpackageForm.get('productId').patchValue(product.productDetails?.id);
    productpackageForm
      .get('packageId')
      .patchValue(product.productDetails?.skuPackageId);
    this.productPackages.push(productpackageForm);
    this.calculateOrderDetail(this.orderForm.getRawValue());
  }

  deleteProductFromOrder(product: any) {
    let existingProductIndex = this.productPackages.value.findIndex(
      (itm) => itm.productId == product.productDetails?.id
    );
    this.productPackages.removeAt(existingProductIndex);
    this.calculateOrderDetail(this.orderForm.getRawValue());
  }

  checkIfAnyProductIsSelfProduct() {
    const productPackages = this.orderForm.get('productPackages') as UntypedFormArray;
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    const ind = productPackages?.value.findIndex(
      (productPackage) =>
        productPackage.productDetails?.audit?.businessAccountId ==
        loggedInAccountId
    );
    return ind == -1 ? false : true;
  }

  calculateOrderDetail(data: any) {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.purchaseOrderService.Calculate_Order_Values(data, uomQuery).subscribe(
      (updatedOrderDetails) => {
        this.patchOrder(updatedOrderDetails);
        this.setMQOQuantity();
      },
      (err) => {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    );
  }

  calculateProductsCostingDetail(change) {
    const orderForm = this.quickCheckoutFormService.createPOForm();
    orderForm.get('buyingType').patchValue(this.buyingType.value);
    orderForm.get('status').patchValue(null);
    orderForm.get('deliveryPickup').patchValue(null);
    orderForm
      .get('requestFrom')
      .get('id')
      .patchValue(Number(this.tokenService.getBusinessAccountIdToken()));

    const productPackages = orderForm.get('productPackages') as UntypedFormArray;
    this.productsList.forEach((ele) => {
      if (!ele.quantity) {
        ele.quantity = ele?.skuThirdMinimumQuantity;
        if (
          [
            'CONTAINER_40_FT',
            'CONTAINER_20_FT',
            'CONTAINER_40_FT_HQ',
          ]?.includes(this.buyingType?.value)
        ) {
          ele.quantity = ele?.containerMqo ?? 1;
        } else if (['PALLET']?.includes(this.buyingType?.value)) {
          ele.quantity = ele.palletMqo ?? 1;
        } else if (['TRUCK']?.includes(this.buyingType?.value)) {
          ele.quantity = ele.truckMqo ?? 1;
        }
        if (ele?.isNoGenericPurchase && this.getTierPricingByProduct(ele?.id)) {
          ele.quantity = this.getTierPricingByProduct(
            ele?.id
          )[0]?.minimumQuantity;
          ele.deliveryDays = this.getTierPricingByProduct(
            ele?.id
          )[0]?.deliveryPricing[1]?.numberOfDays;
          ele.isCustomized = true;
        }
      }
      if (!ele.loadingType) {
        ele.loadingType = 'FLOOR';
      }
      const productPackageForm =
        this.quickCheckoutFormService.productPackageFormCalculate();

      productPackageForm.patchValue(ele);
      if (!change) {
        productPackageForm.get('productDetails').patchValue(ele);
      }
      productPackageForm.get('quantity').patchValue(ele.quantity);

      productPackages.push(productPackageForm);
    });

    const data = orderForm.getRawValue();
    data.isReceiving = false;
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.purchaseOrderService.Calculate_Order_Values(data, uomQuery).subscribe(
      (res) => {
        this.productsList = [];
        this.productsList = res?.productPackages;
        this.productsList = this.getSortedArray(this.productsList);
        if (!change && this.productSearchRequest.searchString) {
          if (this.route.snapshot.queryParams.productKey == 'jutebags') {
            const selectedproduct = this.productsList.find(
              (product) =>
                product?.productDetails.productCode == 'JTB-14BN15-SMPL'
            );
            if (selectedproduct) {
              this.viewDetail(
                selectedproduct,
                selectedproduct?.productDetails?.isCustomizable
              );
            }
          } else if (
            this.route.snapshot.queryParams.productKey == 'cottonbags'
          ) {
            const selectedproduct = this.productsList.find(
              (product) => product?.productDetails.productCode == 'CTB-15WT15'
            );
            if (selectedproduct) {
              this.viewDetail(
                selectedproduct,
                selectedproduct?.productDetails?.isCustomizable
              );
            }
          } else if (
            this.route.snapshot.queryParams.productKey == 'paperbags'
          ) {
            const selectedproduct = this.productsList.find(
              (product) => product?.productDetails.productCode == 'PBW-11BB6'
            );
            if (selectedproduct) {
              this.viewDetail(
                selectedproduct,
                selectedproduct?.productDetails?.isCustomizable
              );
            }
          } else if (
            this.route.snapshot.queryParams.productKey == 'tshirtbag'
          ) {
            const selectedproduct = this.productsList.find(
              (product) => product?.productDetails.productCode == 'tshirtbag'
            );
            if (selectedproduct) {
              this.viewDetail(
                selectedproduct,
                selectedproduct?.productDetails?.isCustomizable
              );
            }
          } else if (this.route.snapshot.queryParams.productKey) {
            const productKey =
              this.route.snapshot.queryParams.productKey.split(':')[0];
            const selectedproduct = this.productsList.find(
              (product) => product?.productDetails.productCode == productKey
            );
            if (selectedproduct) {
              this.viewDetail(
                selectedproduct,
                selectedproduct?.productDetails?.isCustomizable
              );
            }
          }
        }

        this.singleProductDataForm.patchValue(
          this.productsList[this.singleProductDataIndex]
        );
      },
      (err) => {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    );
  }

  getProductsTierPricingDetailByVendor(productIds) {
    this.purchaseOrderService
      .getProductsTierPricingDetailByVendor(productIds)
      .subscribe((res) => {
        this.allTierPricingDetails = res;
        this.calculateProductsCostingDetail(false);
      });
  }

  getTierPricingByProduct(id) {
    return this.allTierPricingDetails[id] ?? [];
  }

  isNotAvailableInTopList(product) {
    if (this.viewType == 'flyer') {
      return true;
    }
    let existingProductIndex = this.productPackages.value.findIndex(
      (itm) => itm.productId == product.id
    );
    if (existingProductIndex == -1) {
      return true;
    } else {
      return false;
    }
  }

  showHideButtonLabel(product) {
    let existingProductIndex = this.productPackages.value.findIndex(
      (itm) => itm.productId == product.id
    );
    if (existingProductIndex != -1) {
      return true;
    } else {
      return false;
    }
  }

  setMQOQuantity() {
    this.productsList?.forEach((ele) => {
      if (
        ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
          this.buyingType?.value
        )
      ) {
        if (ele.quantity) {
          return;
        }
        ele.quantity = ele.productDetails?.containerMqo ?? 1;
      } else if (['PALLET']?.includes(this.buyingType?.value)) {
        if (ele.quantity) {
          return;
        }
        ele.quantity = ele.productDetails.palletMqo ?? 1;
      } else if (['TRUCK']?.includes(this.buyingType?.value)) {
        if (ele.quantity) {
          return;
        }
        ele.quantity = ele.productDetails.truckMqo ?? 1;
      } else if (['SKU']?.includes(this.buyingType?.value)) {
        if (ele.quantity) {
          return;
        }
        ele.quantity = ele.skuThirdMinimumQuantity;
      }
    });
  }

  rateProduct(rating: any, product) {
    const data: any = {
      productMetaId: product.productDetails?.productMetaId,
      rating: rating,
      isFavourite: null,
      ratingType: 'RATING',
    };
    this.purchaseOrderService.rate_product(data).subscribe(
      (res) => {
        this.toastr.success('Successfully Rated');
      },
      (err) => {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    );
  }
  markFavProduct(product) {
    const data: any = {
      productMetaId: product.productDetails?.productMetaId,
      rating: null,
      isFavourite: !product.productDetails?.isFavourite,
      ratingType: 'FAVOURITE',
    };
    this.purchaseOrderService.rate_product(data).subscribe(
      (res) => {
        this.toastr.success('Successfully Updated');
        this.loadProductsList();
      },
      (err) => {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    );
  }

  onBackToOrders() {
    this.router.navigateByUrl('/home/quick-checkout');
  }

  loadCategories() {
    this.purchaseOrderService
      .Get_Product_Categories_Mapped(this.vendorId.value)
      .subscribe(
        (categoryList) => {
          this.categories = categoryList;
          if (
            this.categories?.length > 0 &&
            (this.currentBusinessAccountDetail?.businessLines?.includes(
              'RETAILER'
            ) ||
              this.currentBusinessAccountDetail?.businessLines?.includes(
                'DISTRIBUTOR'
              ))
          ) {
            this.onSelectCategory();
          }
        },
        (error) => {
          this.toastr.error('Something went wrong, please contact DADYIN.');
        }
      );
  }

  actions(event) {
    this.currentMainIndex = event.index;
    if (this.currentMainIndex == 1) {
    }
  }

  saveDraftOrder() {
    this.orderForm.get('isQuickCheckout').patchValue(true);
    this.purchaseOrderService
      .Post_Order(this.orderForm.getRawValue())
      .subscribe(
        (data) => {
          this.toastr.success('Successfully Saved in Draft');
          this.router.navigateByUrl('/home/quick-checkout');
        },
        (err) => {
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  placeOrder() {
    this.orderForm.get('isQuickCheckout').patchValue(true);
    let statusp: any = JSON.parse(
      JSON.stringify(this.orderForm.get('status').value)
    );
    this.orderForm.get('status').patchValue('PLACED');
    this.purchaseOrderService
      .Post_Order(this.orderForm.getRawValue())
      .subscribe(
        (data) => {
          this.currentMainIndex = 1;
          this.patchOrder(data);
          this.toastr.success('Successfully Placed Order');
        },
        (err) => {
          this.orderForm.get('status').patchValue(statusp);
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  saveOrder() {
    let statusp: any = JSON.parse(
      JSON.stringify(this.orderForm.get('status').value)
    );
    this.purchaseOrderService
      .Post_Order(this.orderForm.getRawValue())
      .subscribe(
        (data) => {
          this.currentMainIndex = 1;
          this.patchOrder(data);
          this.toastr.success('Successfully Placed Order');
        },
        (err) => {
          this.orderForm.get('status').patchValue(statusp);
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  deleteOrder() {
    this.purchaseOrderService.Delete_Order(this.orderId).subscribe(
      (data) => {
        this.toastr.success('Order Deleted succesfully.');
        this.router.navigateByUrl('/home/quick-checkout');
      },
      (err) => {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    );
  }

  minus(index: number) {
    if (
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      ) &&
      this.productsList[index].quantity - 1 <
      this.productsList[index].productDetails?.containerMqo
    ) {
      this.toastr.warning(
        "Quantity Can't be Less than Container MQO " +
        this.productsList[index].productDetails?.containerMqo
      );
      return;
    }

    if (
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      ) &&
      this.productsList[index].quantity - 1 <
      this.productsList[index].productDetails?.containerMqo
    ) {
      this.toastr.warning(
        "Quantity Can't be Less than Container MQO " +
        this.productsList[index].productDetails?.containerMqo
      );
      return;
    }
    if (
      this.getTierPricingByProduct(this.productsList[index]?.id)[0]
        ?.minimumQuantity &&
      this.productsList[index]?.isCustomized &&
      this.productsList[index].quantity - 1 <
      this.getTierPricingByProduct(this.productsList[index]?.id)[0]
        ?.minimumQuantity
    ) {
      this.toastr.warning(
        "Quantity Can't be Less than MQO " +
        this.getTierPricingByProduct(this.productsList[index]?.id)[0]
          ?.minimumQuantity
      );
      return;
    }

    if (this.productsList[index].quantity < 2) {
      this.toastr.warning("Quantity Can't go below 1");
      return;
    }
    this.productsList[index].quantity = this.productsList[index].quantity - 1;
    this.calculateProductsCostingDetail(true);
  }

  plus(index: number) {
    this.productsList[index].quantity = this.productsList[index].quantity + 1;
    this.calculateProductsCostingDetail(true);
  }

  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }

  changePage(way: any) {
    if (
      this.productsListDetails?.totalElements <
      this.productsListDetails?.numberOfElements ||
      this.productsListDetails?.totalElements == 0
    ) {
      return;
    }
    if (way == 'prev') {
      if (this.productSearchRequest.pageIndex == 0) {
        return;
      }
      this.productSearchRequest.pageIndex =
        this.productSearchRequest.pageIndex - 1;
      this.loadProductsList();
    }
    if (way == 'next') {
      if (
        this.productSearchRequest.pageIndex + 1 ==
        this.productsListDetails.totalPages
      ) {
        return;
      }
      this.productSearchRequest.pageIndex =
        this.productSearchRequest.pageIndex + 1;
      this.loadProductsList();
    }
  }

  changeQuantity(event: any, i, checkForMqo: any = true, data: any = null) {
    if (
      checkForMqo &&
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      ) &&
      event.target.value < this.productsList[i].productDetails?.containerMqo
    ) {
      this.toastr.warning(
        "Quantity Can't be Less than Container MQO " +
        this.productsList[i].productDetails?.containerMqo
      );
      return;
    }
    if (
      this.getTierPricingByProduct(this.productsList[i]?.id)[0]
        ?.minimumQuantity &&
      this.productsList[i]?.isCustomized &&
      this.productsList[i].quantity <
      this.getTierPricingByProduct(this.productsList[i]?.id)[0]
        ?.minimumQuantity
    ) {
      if (data.minus) {
        data.productForm
          .get('skuQuantities')
          .patchValue(this.productsList[i].quantity + 1);
        this.productsList[i].quantity = this.productsList[i].quantity + 1;
      }
      this.toastr.warning(
        "Quantity Can't be Less than MQO " +
        this.getTierPricingByProduct(this.productsList[i]?.id)[0]
          ?.minimumQuantity
      );
      return;
    }

    if (event.target.value < 1) {
      this.productsList[i].quantity = 1;
    }
    this.calculateProductsCostingDetail(true);
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
    this.calculateOrderDetail(this.orderForm.getRawValue());
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
    this.calculateOrderDetail(this.orderForm.getRawValue());
  }

  onChangeBuyingType() {
    this.productSearchRequest.buyingCapacityType = null;
    const vendorIdFromParams = this.resolveVendorIdFromQueryParams();
    if (vendorIdFromParams) {
      this.vendorId.patchValue(vendorIdFromParams);
      this.productSearchRequest.specificVendor = vendorIdFromParams;
      this.getVendorDetail(vendorIdFromParams);
    } else {
      this.vendorId.patchValue(this.businessAccountService.vendorId);
      this.getVendorDetail(this.vendorId.value);
      this.productSearchRequest.specificVendor =
        this.businessAccountService.vendorId;
    }
    this.loadProductsList();
  }

  getOwner(audit: any) {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    if (!loggedInAccountId) {
      return '';
    }
    if (audit?.businessAccountId == 1) {
      return 'M';
    }
    if (audit?.businessAccountId == loggedInAccountId) {
      return 'S';
    } else {
      return 'T';
    }
  }

  isSelfProduct(productDetails: any) {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    return productDetails?.audit?.businessAccountId == loggedInAccountId
      ? true
      : false;
  }

  isMyProduct(productDetails: any) {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    if (loggedInAccountId) {
      return productDetails?.preferredCustomerId ? true : false;
    } else {
      return false;
    }
  }

  hideAddToOrder(audit: any) {
    if (
      audit?.businessAccountId == this.vendorId.value ||
      this.getOwner(audit) == 'S'
    ) {
      return false;
    } else {
      return true;
    }
  }

  get vendorId() {
    return this.orderForm.get('requestTo').get('id');
  }

  filterProductByOwnership(ownership: any) {
    if (this.ownershipTag == ownership) {
      this.ownershipTag = null;
      this.productSearchRequest.ownershipFilter = null;
      this.productSearchRequest.ownershipFilter =
        '&filter=(audit.businessAccount.id:' +
        this.vendorId.value +
        ' or (audit.businessAccount.id:' +
        (this.businessAccountService.currentBusinessAccountId || 9999) +
        ' and vendorProductBusinessId:' +
        this.vendorId.value +
        '))';

      this.ownershipTag = null;
      this.loadProductsList();
      return;
    }
    this.ownershipTag = ownership;
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    let filter: any = null;

    if (ownership == 'S') {
      filter =
        '&filter=audit.businessAccount.id:' +
        loggedInAccountId +
        ' or audit.businessAccount.id:' +
        this.vendorId.value;
    }

    if (ownership == 'M') {
      filter =
        '&filter=audit.businessAccount.id:1 or audit.businessAccount.id:' +
        this.vendorId.value;
    }

    if (ownership == 'T') {
      filter =
        '&filter=audit.businessAccount.id!1 and audit.businessAccount.id!' +
        loggedInAccountId;
    }

    this.productSearchRequest.ownershipFilter = filter;
    this.loadProductsList();
  }

  get isEditable() {
    return this.orderForm.getRawValue()?.status == 'DRAFT';
  }

  get deliveryAddressValue() {
    if (this.orderForm.getRawValue().deliveryAddress?.addressLine) {
      const address: any = Object.values(
        this.orderForm.getRawValue()?.deliveryAddress
      ).join(',');
      return address;
    } else {
      return '';
    }
  }

  onAddressSelection(event: any, control) {
    let address: any = {
      addressLine: '',
      addressCountry: '',
      addressState: '',
      addressCity: '',
      addressZipCode: '',
    };
    address.addressLine = event.formatted_address;
    event.address_components.forEach((element) => {
      if (element.types.includes('country')) {
        address.addressCountry = element.long_name;
      }
      if (element.types.includes('administrative_area_level_1')) {
        address.addressState = element.long_name;
      }
      if (element.types.includes('administrative_area_level_3')) {
        address.addressCity = element.long_name;
      }
      if (element.types.includes('postal_code')) {
        address.addressZipCode = element.long_name;
      }
    });
    control.patchValue(address);
  }

  getVendorDetail(id) {
    this.businessAccountService
      .getBusinessAccountDetail(id)
      .pipe(first())
      .subscribe((res) => {
        // Simple race condition fix: only update if this is still the current vendor
        if (this.vendorId.value === id) {
          this.selectedVendorDetail = res;
          this.cdr.detectChanges(); // Force UI update
        }
        if (
          this.businessAccountService.currentbusinessLines?.includes('RETAILER') && !this.route.snapshot.queryParams.vendorId
        ) {
          this.loadCategories();
        }
        this.getProductTypesByVendorId(this.vendorId.value);
      });
  }

  private resolveVendorIdFromQueryParams(): number | null {
    const qp: any = this.route?.snapshot?.queryParams ?? {};

    const directVendorId = Number(qp.vendorId);
    if (!Number.isNaN(directVendorId) && directVendorId) {
      return directVendorId;
    }

    const vendorKey = (qp.vendorKey ?? '').toString().trim().toLowerCase();
    if (!vendorKey) {
      return null;
    }

    return this.vendorKeyToIdMap[vendorKey] ?? null;
  }


  /**
   * Generate WhatsApp URL using vendor's primary contact phone number
   * @param messageType - Type of message ('query' or 'demo')
   * @returns WhatsApp URL string
   */
  getVendorWhatsAppUrl(messageType: 'query' | 'demo' = 'demo'): string {
    const defaultPhone = '16468796854'; // Default phone number as fallback
    const defaultQueryMessage = 'Hi,I have a query related to Dadyin platform.';
    const defaultDemoMessage = 'Hi,I want to book a demo for platform';

    let phoneNumber = defaultPhone;
    let message =
      messageType === 'query' ? defaultQueryMessage : defaultDemoMessage;

    // Get phone number from selected vendor's primary contact
    if (this.selectedVendorDetail?.primaryContact?.phone?.number) {
      phoneNumber = this.selectedVendorDetail.primaryContact.phone.number;
      // Remove any non-numeric characters except + for international format
      phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Customize message for vendor
      const vendorName = this.selectedVendorDetail.name || 'vendor';
      message =
        messageType === 'query'
          ? `Hi ${vendorName}, I have a query related to Dadyin platform.`
          : `Hi ${vendorName}, I want to book a demo for platform`;
    } else {
    }

    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}&type=phone_number`;

    return whatsappUrl;
  }

  onChangeVendor() {
    const vendor = this.businessAccountService.vendorList.find(
      (vendor) => vendor.relationAccountId == this.vendorId.value
    );
    this.getVendorDetail(this.vendorId.value);

    this.incoTermId.patchValue(vendor?.incoTermId);
    this.departurePortId.patchValue(vendor?.portId);
    if (vendor?.isImportExport) {
      this.importLocalType.patchValue('CONTAINER');
      this.buyingType.patchValue('CONTAINER_40_FT_HQ');
    }
    if (vendor?.fulfillmentLimitInDays) {
      this.orderForm.get('requiredByDate').patchValue(null);
      const currentDate = new Date();
      const futureDate = new Date(
        currentDate.getTime() +
        vendor?.fulfillmentLimitInDays * 24 * 60 * 60 * 1000
      );
      this.orderForm
        .get('requiredByDate')
        .patchValue(futureDate.toISOString().split('T')[0]);
      this.minRequiredDate = futureDate.toISOString().split('T')[0];
    }

    this.ownershipTag = null;
    this.productSearchRequest.ownershipFilter =
      '&filter=(audit.businessAccount.id:' +
      this.vendorId.value +
      ' or (audit.businessAccount.id:' +
      (this.businessAccountService.currentBusinessAccountId || 9999) +
      ' and vendorProductBusinessId:' +
      this.vendorId.value +
      '))';

    this.loadProductsList();
  }

  get incoTermId() {
    return this.orderForm.get('incoTermId');
  }

  get departurePortId() {
    return this.orderForm.get('departurePortId');
  }

  get deliveryAddress() {
    return this.orderForm.get('deliveryAddress');
  }
  get deliveryPickup() {
    return this.orderForm.get('deliveryPickup');
  }

  confirmDeleteOrder() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteOrder();
        }
      });
  }

  viewDetail(product: any, customised) {
    // if (customised == true && this.isSelfProduct(product?.productDetails)) {
    //   this.toastr.warning('Customisation Not allowed for Self Product');
    //   return;
    // }
    if (
      !customised &&
      (this.isNoGenericPurchase(product) || product?.isCustomized)
    ) {
      customised = true;
    }
    if (this.hideAddToOrder(product?.productDetails?.audit)) {
      this.toastr.warning(
        'This Product is not available for currently selected Vendor'
      );
      return;
    }
    this.singleProductDataForm.patchValue(product);
    const index = this.productsList.findIndex(
      (it) =>
        it.productDetails.productCode == product.productDetails.productCode
    );
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
    const addToOrderEvent =
      dialogRef.componentInstance.addToOrderEvent.subscribe((res) => {
        let productData = this.singleProductDataForm.getRawValue();
        if (res.isCustomizable) {
          productData.isCustomized = true;
        }
        this.addProductToOrder(productData);
      });

    dialogRef.afterClosed().subscribe((result) => {
      addToOrderEvent.unsubscribe();
    });

    const changeQuantityEvent =
      dialogRef.componentInstance.changeQuantityEvent.subscribe((data) => {
        this.productsList.forEach((ele) => {
          if (ele.isCustomized == null) {
            ele.isCustomized = false;
          }
        });
        this.productsList[this.singleProductDataIndex] = data.productData;
        this.productsList[this.singleProductDataIndex].isCustomized =
          data.isCustomizable;
        this.productsList[this.singleProductDataIndex].quantity =
          data.event.target.value;
        this.changeQuantity(data.event, index, !data.isCustomizable, data);
      });

    dialogRef.afterClosed().subscribe((result) => {
      changeQuantityEvent.unsubscribe();
    });

    const calculateDialogEvent =
      dialogRef.componentInstance.calculateDialogEvent.subscribe((data) => {
        this.productsList.forEach((ele) => {
          if (ele.isCustomized == null) {
            ele.isCustomized = false;
          }
        });
        this.productsList[index] = data.product;
        this.productsList[index].isCustomized = data.customizable;
        this.calculateProductsCostingDetail(true);
      });

    dialogRef.afterClosed().subscribe((result) => {
      calculateDialogEvent.unsubscribe();
    });
  }

  getImageObjectArray(images: any) {
    const newarr = images.map((item: any) => {
      (item.image = item),
        (item.thumbImage = ''),
        (item.alt = ''),
        (item.title = '');
    });
    return newarr;
  }

  currentIndex: number = 0;

  next(cardLength) {
    this.currentIndex = (this.currentIndex + 1) % cardLength;
  }

  prev(cardLength) {
    this.currentIndex = (this.currentIndex - 1 + cardLength) % cardLength;
  }

  setQuantity(value, i) {
    const event = { target: { value: value } };
    this.productsList[i].quantity = value;
    this.changeQuantity(event, i);
  }

  checkout() {
    this.authService.quickCheckoutData = this.orderForm.getRawValue();
    this.router.navigateByUrl('/signin');
  }

  get totalSkus() {
    let quantity = 0;
    this.productPackages.value?.forEach((element) => {
      quantity = quantity + element.quantity;
    });

    return quantity;
  }

  getRating(value: any): string {
    // Step 1: Convert the element to a unique number
    const uniqueNumber = this.hashCode(value);

    // Step 2: Normalize the unique number to a value between 0 and 1
    const normalizedValue = (uniqueNumber % 1000000) / 1000000.0;

    // Step 3: Scale the value to be between 4 and 5
    const rating = 4 + normalizedValue;

    // Step 4: Format the rating to one digit after the decimal
    const formattedRating = rating.toFixed(0);

    return formattedRating;
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

  get localTimeZone() {
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return localTimeZone;
  }

  confirmPlaceOrder() {
    if (this.productPackages.controls?.length == 0) {
      this.toastr.warning('Please add products to order');
      return;
    }

    if (
      this.importLocalType?.value == 'LOCAL' &&
      this.deliveryPickup?.value == 'DELIVERY' &&
      !this.deliveryAddressValue
    ) {
      this.deliveryAddress.markAllAsTouched();
      this.deliveryAddress.get('addressLine').setErrors({ required: true });
      this.toastr.warning('Please add delivery Address');
      return;
    }

    this.dialog
      .open(TermsDialogComponent, {
        panelClass: 'mobile-view-dialog',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.placeOrder();
        }
      });
  }

  confirmCheckout() {
    this.dialog
      .open(TermsDialogComponent, {
        panelClass: 'mobile-view-dialog',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.checkout();
        }
      });
  }

  getSortedArray(productsList: any) {
    const priorityProducts: any[] = [
      { productCode: 'JTB-14BN15-SMPL', priority: 1 },
      { productCode: 'CTB-15WT15', priority: 2 },
      { productCode: 'PBW-11BB6', priority: 3 },
      { productCode: 'T-6W5915', priority: 4 },
      { productCode: 'RB-19M605', priority: 5 },
      { productCode: 'NWS-17M1442', priority: 6 },
    ];
    if (!Array.isArray(productsList)) {
      return productsList;
    }
    return productsList.sort((a, b) => {
      const priorityA = priorityProducts.find(
        (p) => p.productCode === a.productDetails?.productCode
      )?.priority;
      const priorityB = priorityProducts.find(
        (p) => p.productCode === b.productDetails?.productCode
      )?.priority;

      if (priorityA && priorityB) {
        if (priorityA === priorityB) {
          // If priorities are equal, sort by productTypeId
          return (
            a.productDetails.productTypeId - b.productDetails.productTypeId
          );
        } else {
          return priorityA - priorityB;
        }
      } else if (priorityA) {
        return -1;
      } else if (priorityB) {
        return 1;
      } else {
        // If neither product has a priority, sort by productTypeId
        return (
          a.productDetails?.productTypeId - b.productDetails?.productTypeId
        );
      }
    });
  }

  viewCart() {
    if (this.viewType == 'flyer') {
      this.cartView = !this.cartView;
    }
  }

  /**
   * Check if the current vendor matches the configured default vendor.
   * @returns boolean indicating if current vendor matches the default vendor
   */
  isDefaultVendor(): boolean {
    return this.vendorId?.value === this.businessAccountService.vendorId;
  }

  /**
   * Get the appropriate vendor logo URL
   * @returns string URL for the vendor logo
   */
  getVendorLogo(): string {
    // If vendor has a business logo, use it
    if (this.selectedVendorDetail?.businessLogo) {
      return this.imgUrl + this.selectedVendorDetail.businessLogo;
    }

    // For default vendor, use default logo
    if (this.isDefaultVendor()) {
      return '../../../assets/img/business_logo.png';
    }

    // Fallback - should not reach here due to template condition
    return '../../../assets/img/business_logo.png';
  }
}
