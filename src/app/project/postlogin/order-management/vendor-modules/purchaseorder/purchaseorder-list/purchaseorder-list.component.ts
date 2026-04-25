import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { PurchaseOrderService } from 'src/app/project/postlogin/quick-checkout/services/purchase-order.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';

import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-purchaseorder-list',
    templateUrl: './purchaseorder-list.component.html',
    styleUrls: ['./purchaseorder-list.component.scss'],
    standalone: true,
    imports: [
    SearchFilterComponent,
    DadyinButtonComponent,
    CdkDrag,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent
],
})
export class PurchaseorderListComponent implements OnInit {
  @Input('single') single = false;
  @Input('vendorId') vendorId = null;
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public purchaseOrdersList: any[];
  public searchText: string;
  public headers = [
    { name: 'DATE', prop: 'date', type: 'date', sortable: true },
    { name: 'PO#', prop: 'transactionId', sortable: true },
    { name: 'VENDOR NAME', prop: 'requestToName', sortable: true },
    { name: 'CONTACT', prop: 'contactPhone', sortable: true },
    { name: 'INCOTERMS', prop: 'incoTermDescription', sortable: true },
    { name: 'BUYING TYPE', prop: 'buyingType', sortable: true },
    {
      name: 'PRODUCTS #',
      prop: 'noOfProductsInOrder',
      dataType: 'number',
      decimal: false,
      sortable: true,
    },
    {
      name: 'SKU #',
      prop: 'totalSku',
      dataType: 'number',
      decimal: false,
      sortable: true,
    },
    { name: 'QUOTE #', prop: 'rfQuotationId', sortable: true },
    { name: 'SO #', prop: 'saleOrderTransactionId', sortable: true },
    {
      name: 'PRICE',
      prop: 'totalCost',
      type: 'uom',
      dataType: 'number',
      minWidth: '150px',
      sortable: true,
    },
    {
      name: 'PAYMENT STATUS',
      prop: 'paymentStatus',
      type: 'status',
      sortable: true,
      width: '120px',
    },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];

  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'audit.lastModifiedDate,desc';

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public orderApi: OrderManagementService,
    public purchaseOrderService: PurchaseOrderService,
    public apiService: ApiService,
    public uomService: UomService,
    public formService: FormsService,
    public http: HttpClient,
    public fb: UntypedFormBuilder,
    public businessAccountService: BusinessAccountService
  ) {}

  ngOnInit() {
    this.getPreference();
  }

  loadPurchaseOrdersList(): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    let filter = '';
    if (this.vendorId) {
      filter = filter + `&filter=requestTo.id:${this.vendorId}`;
    }
    if (this.businessAccountService.currentBusinessAccountId) {
      filter =
        filter +
        `&filter=requestFrom.id:${this.businessAccountService.currentBusinessAccountId}`;
    }

    this.purchaseOrderService
      .Get_All_Order(
        this.searchText,
        this.pageS,
        this.pageIndex,
        this.sortQuery,
        uomQuery,
        filter
      )
      .subscribe((res) => {
        this.purchaseOrdersList = res.content;
        this.purchaseOrdersList.map((item) => {
          item.requestToName = item.requestTo.name;
          item.requestFromName = item.requestFrom.name;
        });
        this.purchaseOrdersList.map((item) => {
          if (item.paymentStatus != 'COMPLETED' && item.status != 'DRAFT') {
            item.showPayNow = true;
          }
          if (item.importLocalType == 'LOCAL') {
            item.incoTermDescription = item.deliveryPickup;
          }
          if (item?.buyingType == 'CONTAINER_20_FT') {
            item.buyingType = '20_FT';
          }
          if (item?.buyingType == 'CONTAINER_40_FT') {
            item.buyingType = '40_FT';
          }
          if (item?.buyingType == 'CONTAINER_40_FT_HQ') {
            item.buyingType = '40_FT_HQ';
          }
        });
        this.pageConfig.totalElements = res?.totalElements;
        this.pageConfig.totalPages = res?.totalPages;
      });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/order-management/vendor/purchaseorder/edit/' + event?.row?.id
          );
        }
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  addPurchaseorder(): void {
    if (this.vendorId) {
      this.router.navigateByUrl(
        `home/order-management/vendor/purchaseorder/add?vendorId=${this.vendorId}`
      );
    } else {
      this.router.navigateByUrl(
        'home/order-management/vendor/purchaseorder/add'
      );
    }
  }

  onInput(searchText: string): void {
    this.searchText = searchText;
    this.loadPurchaseOrdersList();
  }

  editRecord(event): void {
    this.router.navigateByUrl(
      'home/order-management/vendor/purchaseorder/edit/' + event.data.id
    );
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadPurchaseOrdersList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadPurchaseOrdersList();
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForPurchaseorder = this.preferredUoms.find(
        (item) => item.componentType == 'ORDER'
      );
      preferenceForPurchaseorder?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForPurchaseorder);
      this.loadPurchaseOrdersList();
    });
  }
}
