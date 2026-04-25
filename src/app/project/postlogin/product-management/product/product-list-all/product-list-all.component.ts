import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { UomService } from 'src/app/service/uom.service';
import { FormsService } from 'src/app/service/forms.service';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FilterBoxComponent } from './filter-box/filter-box.component';
import { ProductService } from '../service/product.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDialogComponent } from '../modals/customer-dialog/customer-dialog.component';
import { ProductManagementService } from '../../service/product-management.service';
import { AddRawMaterialDialogComponent } from 'src/app/shared/dialogs/add-raw-material/add-raw-material-dialog.component';
import { Subject, Subscription, Observable } from 'rxjs';
import { switchMap, finalize, map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/common.service';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DataTableComponent } from '../../../../../shared/component/data-table/data-table.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../shared/component/search-filter/search-filter.component';
import { MatBadge } from '@angular/material/badge';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-product-list-all',
    templateUrl: './product-list-all.component.html',
    styleUrls: ['./product-list-all.component.scss'],
    imports: [
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatBadge,
        MatTabContent,
        SearchFilterComponent,
        FilterBoxComponent,
        DadyinButtonComponent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent,
        NgClass,
        ExtendedModule,
        DecimalPipe,
        DatePipe
    ]
})
export class ProductListAllComponent implements OnInit, OnDestroy {
  searchControl = new UntypedFormControl('');
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }
  @ViewChild(FilterBoxComponent) filterBoxComponent: FilterBoxComponent;
  @ViewChild('bulkUploadFileInput') bulkUploadFileInput!: ElementRef<HTMLInputElement>;
  uomSetting = false;
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  public productsList: any[];
  public calculatorDetailsList: any[] = [];
  public processDetailsList: any[] = [];
  public filterValue: string;

  // Concurrency handling for search requests
  private searchRequestSubject = new Subject<{ filter: string; searchValue: string }>();
  private searchSubscription: Subscription;
  private currentRequestId = 0;

  // Tooltip properties
  loading = false;
  bulkUploadInProgress = false;
  downloadTemplateInProgress = false;
  salesData: any[] = [];
  inventoryLedgerData: any = null;
  labelTooltip = '';
  private hoverTimeout: any = null;
  private currentProductId: number | null = null;
  private currentProp: string | null = null;
  private cache: { [key: string]: any } = {};
  private subs: { [key: string]: any } = {};
  public productEditLink: any = '/home/product-management/product/edit/';
  productSubtypeEditLink: any =
    '/home/product-management/product-type/subtype/edit/';
  productTypeEditLink: any = '/home/product-management/product-type/edit/';
  productTemplateEditLink: any =
    '/home/product-management/product-template/edit/';
  public headers = [
    { name: 'PRODUCT CODE', prop: 'productCode', sortable: true },
    { name: 'PRODUCT DETAILS', prop: 'description', sortable: true },
    {
      name: 'PRODUCT TYPE ',
      prop: 'productTypeDescription',
      sortable: true,
      isLink: true,
      link: this.productTypeEditLink,
      idKey: 'productTypeId',
    },
    {
      name: 'SUBTYPE',
      prop: 'productSubTypeDescription',
      sortable: true,
      isLink: true,
      link: this.productSubtypeEditLink,
      idKey: 'productSubTypeId',
    },
    {
      name: 'TEMPLATE',
      prop: 'productTemplateCode',
      sortable: true,
      isLink: true,
      link: this.productTemplateEditLink,
      idKey: 'productTemplateId',
    },
    { name: '#QOH(SKU)', prop: 'qoh', sortable: true, isTooltip: true, },
    { name: 'MQS', prop: 'mqs', sortable: true },
    {
      name: 'METRIC COST',
      prop: 'metricCost',
      type: 'uom',
      dataType: 'number',
      hideNumberFormatter: true,
      isCurrency: true,
    },
    {
      name: 'SKU COST',
      prop: 'skuCost',
      type: 'uom',
      dataType: 'number',
      isCurrency: true,
      isTooltip: true,
    },
    {
      name: 'SKU PRICE',
      prop: 'skuPrice',
      type: 'uom',
      dataType: 'number',
      isCurrency: true,
      isTooltip: true,
    },
    {
      name: 'STATUS',
      prop: 'status',
      type: 'status',
      sortable: true,
      isTooltip: true,
    },

    { name: 'ACTIONS', prop: 'action', type: 'menu', minWidth: '200px' },
  ];
  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
    {
      label: 'Copy',
      icon: 'content_copy',
    },
    {
      label: 'Copy For Customer',
      icon: 'workspace_premium',
    },
    {
      label: 'Share',
      icon: 'share',
    },
  ];
  public pageConfig = null;

  public activeTab = 'product-details';
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'productCode';

  currentMainIndex: number = 0;
  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Product Details',
      badge: 0,
      index: 0,
    },
  ];

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public apiService: ApiService,
    public http: HttpClient,
    public service: ProductManagementService,
    public formsService: FormsService,
    public toastr: ToastrService,
    public productService: ProductService,
    public businessAccountService: BusinessAccountService,
    public uomService: UomService,
    public dialog: MatDialog,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.restoreSearchAndFilterState();
    this.getPreference();
    this.pageConfig = {
      itemPerPage: 20,
      sizeOption: [20, 50, 75, 100],
    };
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
    this.searchRequestSubject.complete();
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    Object.values(this.subs).forEach(sub => sub?.unsubscribe());
  }

  private setupSearchSubscription(): void {
    // Use switchMap to cancel previous requests when a new search is initiated
    this.searchSubscription = this.searchRequestSubject
      .pipe(
        switchMap(({ filter, searchValue }) => {
          // Increment request ID to track the latest request
          const requestId = ++this.currentRequestId;
          return this.performProductSearch(filter, searchValue, requestId).pipe(
            finalize(() => {
              // Request completed (either successfully or cancelled)
            })
          );
        })
      )
      .subscribe(({ products, requestId }) => {
        // Only update if this is the latest request (safety check in case of race conditions)
        if (requestId === this.currentRequestId) {
          this.updateProductsList(products);
        }
      });
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      const preferenceForContainer = preference.find(
        (item) => item.componentType == 'PRODUCT'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);
      if (this.filterBoxComponent) {
        this.filterBoxComponent?.apply();
      } else {
        // Use restored filter value if available
        this.loadProductsList(this.filterValue || '');
      }
    });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  loadProductsList(filter: any = ''): void {
    // Emit search request through Subject to ensure proper concurrency handling
    const searchValue = this.searchControl.value || '';
    this.searchRequestSubject.next({ filter, searchValue });
  }

  private performProductSearch(filter: any, searchValue: string, requestId: number): Observable<{ products: any; requestId: number }> {
    // Build filter with status exclusion
    filter = filter + "&filter=status!'DELETED'";
    if (this.route.snapshot.queryParams['productTypeId']) {
      filter =
        filter +
        '&filter=productTypeId:' +
        this.route.snapshot.queryParams['productTypeId'];
    }

    if (this.route.snapshot.queryParams['productSubTypeId']) {
      filter =
        filter +
        '&filter=productSubTypeId:' +
        this.route.snapshot.queryParams['productSubTypeId'];
    }

    if (
      ['RETAILER', 'DISTRIBUTOR'].includes(
        this.businessAccountService.currentbusinessLines
      )
    ) {
      filter = filter + '&filter=audit.businessAccount.id!1';
    }

    const businessAccountId =
      this.businessAccountService.currentBusinessAccountId;
    if (businessAccountId == 1) {
      filter =
        filter +
        `&filter=audit.businessAccount.id:${businessAccountId} or isDadyInQuickCheckoutEligible:true`;
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

    return this.apiService
      .Get_Product_List_By_Search(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        searchValue,
        filter
      )
      .pipe(
        map((products: any) => {
          // Return both products and requestId to verify it's the latest request
          return { products, requestId };
        })
      );
  }

  private updateProductsList(products: any): void {
    this.pageConfig.totalElements = products?.totalElements;
    this.pageConfig.totalPages = products?.totalPages;
    this.productsList = products?.content;
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    this.productsList.forEach((x) => {
      x.createdBy =
        x.audit.businessAccountId == 1
          ? 'M'
          : x.audit.businessAccountId == loggedInAccountId &&
            x.isSelfProduct
            ? 'S'
            : 'T';
    });
    this.productsList.forEach((x) => {
      if (x.preferredCustomerId) {
        x.isMyProduct = true;
      }
      console.log(x.qoh < x.mqs);
      if (x.qoh < x.mqs) {
        x.showQohAlert = true;
      }
    });
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/product-management/product/edit/' + event.row.id
          );
        }
        break;
      case 'Copy':
        if (event?.row?.id) {
          this.copyProductDataById(event.row.id);
        }
        break;

      case 'Copy For Customer':
        if (!event?.row?.isCustomizable) {
          this.toastr.warning('This Product is not Customizable');
          return;
        }
        if (event?.row?.id) {
          this.openCustomerModal(event.row.id);
        }

        break;
      case 'Share':
        if (event?.row) {
          this.shareProduct(event.row);
        }
        break;
      case 'Download':
        break;
    }
  }

  addProduct(): void {
    this.router.navigateByUrl('/home/product-management/product/add');
  }

  downloadBulkUploadTemplate(): void {
    if (this.downloadTemplateInProgress) return;
    this.downloadTemplateInProgress = true;

    this.productService
      .downloadBulkUploadSampleExcelTemplate()
      .pipe(finalize(() => (this.downloadTemplateInProgress = false)))
      .subscribe({
        next: ({ blob, filename }) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename || 'product_bulk_upload_template.xlsx';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          this.toastr.success('Template downloaded');
        },
        error: () => this.toastr.error('Failed to download template'),
      });
  }

  triggerBulkUpload(): void {
    if (this.bulkUploadInProgress) return;
    this.bulkUploadFileInput?.nativeElement?.click();
  }

  onBulkUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    const isXlsx =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name?.toLowerCase()?.endsWith('.xlsx');
    if (!isXlsx) {
      this.toastr.warning('Please select an Excel (.xlsx) file');
      if (input) input.value = '';
      return;
    }

    this.bulkUploadInProgress = true;
    this.productService
      .bulkUploadProducts(file)
      .pipe(
        finalize(() => {
          this.bulkUploadInProgress = false;
          if (input) input.value = '';
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.success) this.toastr.success(res?.message || 'Bulk upload completed');
          else this.toastr.warning(res?.message || 'Bulk upload completed with issues');

          if (res?.failureCount > 0 && Array.isArray(res?.errors) && res.errors.length) {
            // Keep UI simple: show first error; rest can be checked in console.
            this.toastr.warning(res.errors[0]);
            console.warn('Bulk upload errors:', res.errors);
          }

          // Refresh list after upload
          this.loadProductsList(this.filterValue || '');
        },
        error: () => this.toastr.error('Bulk upload failed'),
      });
  }

  addRawMaterial(): void {
    this.dialog
      .open(AddRawMaterialDialogComponent, {
        width: '900px',
        disableClose: true,
        data: { type: 'add' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          console.log(result);
        }
      });
  }

  onInput(): void {
    this.filterBoxComponent?.apply();
  }

  async copyProductDataById(id: any) {
    try {
      const res = await this.apiService.Copy_Product_ById(id);
      this.productService.clonePayload = res;
      this.toastr.success('Product copied Successfully');
      this.addProduct();
    } catch (err: any) {
      this.toastr.error("Product can't be copied");
    }
  }

  async copyProductDataForCustomerById(id: any, customerId: any) {
    try {
      const res = await this.apiService.Copy_ProductForCustomer_ById(
        id,
        customerId
      );
      this.productService.clonePayload = res;
      this.toastr.success('Product copied Successfully');
      this.addProduct();
    } catch (err: any) {
      this.toastr.error("Product can't be copied");
    }
  }

  editRecord(event): void {
    if (event?.data?.id) {
      // Preserve search and filter state in ProductService
      this.productService.savedSearchValue = this.searchControl.value || '';
      this.productService.savedFilterValue = this.filterValue || '';
      
      this.router.navigate([
        'home/product-management/product/edit',
        event.data.id,
        event.data.createdBy,
      ]);
    }
  }

  sort(event) {
    if (event.active == 'lastModifiedDate') {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
      this.loadProductsList();
    } else {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadProductsList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadProductsList();
  }

  changeMainTab(event: number): void {
    this.currentMainIndex = event;
    // this.navigateToUrl();
  }

  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }

  filterProducts(event) {
    this.filterValue = event;
    this.loadProductsList(event);
  }

  private restoreSearchAndFilterState(): void {
    // Restore search and filter from ProductService
    if (this.productService.savedSearchValue) {
      this.searchControl.setValue(this.productService.savedSearchValue);
    }
    if (this.productService.savedFilterValue) {
      this.filterValue = this.productService.savedFilterValue;
    }
  }

  openCustomerModal(id: any) {
    this.dialog
      .open(CustomerDialogComponent, {
        width: '500px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((customerId) => {
        if (customerId) {
          this.copyProductDataForCustomerById(id, customerId);
        }
      });
  }

  // Tooltip methods - ultra simplified
  showPopover(product: any, event: MouseEvent, prop: string) {
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    const productId = product?.id;
    const businessAccountId = this.businessAccountService.currentBusinessAccountId;
    if (!productId || !businessAccountId) return;

    this.labelTooltip = { 'skuCost': 'Prev. Purchases', 'skuPrice': 'Prev. Sales', 'qoh': 'Inventory Ledger' }[prop] || '';
    const dataKey = `${productId}_${prop}`;
    this.currentProductId = productId;
    this.currentProp = prop;

    if (this.cache[dataKey] !== undefined) {
      this.setData(prop, this.cache[dataKey]);
      this.loading = false;
      return;
    }

    if (this.subs[dataKey]) this.subs[dataKey].unsubscribe();
    this.loading = true;
    this.hoverTimeout = setTimeout(() => {
      if (this.currentProductId === productId && this.currentProp === prop) {
        this.fetchData(productId, businessAccountId, prop, dataKey);
      }
    }, 500);
  }

  hidePopover() {
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
  }

  private fetchData(productId: number, businessAccountId: number, prop: string, dataKey: string) {
    if (this.subs[dataKey]) this.subs[dataKey].unsubscribe();
    
    const apis: { [key: string]: () => Observable<any> } = {
      'qoh': () => this.apiService.getInventoryLedgerData(productId, businessAccountId),
      'skuPrice': () => this.apiService.getPreviousSalesData(productId, businessAccountId),
      'skuCost': () => this.apiService.getPreviousPurchasesData(productId, businessAccountId)
    };
    
    if (!apis[prop]) return;
    
    this.subs[dataKey] = apis[prop]().subscribe({
      next: (res: any) => {
        if (this.currentProductId === productId && this.currentProp === prop) {
          const data = prop === 'qoh' ? (res || null) : (res?.salesData || res?.purchaseData || []);
          // Use setTimeout to prevent tooltip from closing during state change
          setTimeout(() => {
            if (this.currentProductId === productId && this.currentProp === prop) {
              this.setData(prop, data, dataKey);
              this.loading = false;
            }
          }, 0);
        }
        delete this.subs[dataKey];
      },
      error: () => {
        if (this.currentProductId === productId && this.currentProp === prop) {
          setTimeout(() => {
            if (this.currentProductId === productId && this.currentProp === prop) {
              this.setData(prop, prop === 'qoh' ? null : [], dataKey);
              this.loading = false;
            }
          }, 0);
        }
        delete this.subs[dataKey];
      }
    });
  }

  private setData(prop: string, data: any, dataKey?: string) {
    if (prop === 'qoh') this.inventoryLedgerData = data;
    else this.salesData = Array.isArray(data) ? data : [];
    if (dataKey) this.cache[dataKey] = data;
  }

  clearTooltipCache() {
    Object.values(this.subs).forEach(sub => sub?.unsubscribe());
    this.subs = {};
    this.cache = {};
    this.inventoryLedgerData = null;
    this.salesData = [];
    this.currentProductId = null;
    this.currentProp = null;
  }

  async shareProduct(product: any) {
    const navigator = window.navigator as any;
    const productData = {
      id: product?.id,
      productCode: product?.productCode,
      description: product?.description,
      productDetails: product,
      productMetaId: product?.productMetaId
    };
    const shareUrl = this.commonService.generateShareUrl(productData);
    const urlToShare = shareUrl || '';
    if (!urlToShare) {
      this.toastr.warning('Unable to generate share URL. Product code and description are required.');
      return;
    }
    const shareTitle = productData?.description || 'Dadyin product';

    // Best-effort clipboard copy (may fail if clipboard permission is blocked)
    await navigator?.clipboard?.writeText(urlToShare).catch(() => {});

    // On Windows desktop, calling share() with only "title" can open a blank share popup.
    // Always provide "url" (and optionally "text") to avoid blank UI.
    if (navigator.share && (!navigator.canShare || navigator.canShare({ url: urlToShare }))) {
      navigator
        .share({
          title: shareTitle,
          text: urlToShare,
          url: urlToShare,
        })
        .then(() => {
          this.toastr.success('Product link Copied successfully');
          console.log('Successful share');
        })
        .catch((error) => {
          console.log('Error sharing', error);
          this.toastr.success('Product link Copied successfully');
        });
    } else {
      this.toastr.success('Product link Copied successfully');
    }
  }









}
