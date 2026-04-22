import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from 'src/app/project/postlogin/quick-checkout/services/purchase-order.service';
import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';
import { ApiService } from 'src/app/service/api.service';
import { UomService } from 'src/app/service/uom.service';
import { DataTableComponent } from '../../../shared/component/data-table/data-table.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../shared/component/search-filter/search-filter.component';
import { MatBadgeModule } from '@angular/material/badge';
import { NgFor, NgIf } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-quick-checkout',
    templateUrl: './quick-checkout.html',
    styleUrls: ['./quick-checkout.scss'],
    standalone: true,
    imports: [
        MatTabsModule,
        NgFor,
        MatBadgeModule,
        NgIf,
        SearchFilterComponent,
        DadyinButtonComponent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent,
    ],
})
export class QuickCheckoutComponent implements OnInit {
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  uomSetting = false;
  public preferredUoms: any[];
  public orders: any[];
  public searchText: any;
  public filter: any = 'filter=isQuickCheckout:true';
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'audit.createdDate,desc';
  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  currentMainIndex: number = 0;
  public headers = [
    { name: 'DATE', prop: 'date', type: 'date', sortable: true, width: '90px' },
    { name: 'PO#', prop: 'transactionId', sortable: true, width: '140px' },
    {
      name: 'VENDOR NAME',
      prop: 'requestToName',
      sortable: true,
      width: 'unset',
    },
    {
      name: 'INCOTERMS',
      prop: 'incoTermDescription',
      sortable: true,
      width: '90px',
    },
    { name: 'BUYING TYPE', prop: 'buyingType', sortable: true, width: '120px' },
    {
      name: 'SKUS',
      prop: 'totalSku',
      dataType: 'number',
      decimal: false,
      sortable: true,
      width: '90px',
    },
    {
      name: '#PRODUCTS',
      prop: 'noOfProductsInOrder',
      sortable: true,
      dataType: 'number',
      decimal: false,
      width: '90px',
    },
    {
      name: 'SO #',
      prop: 'saleOrderTransactionId',
      sortable: true,
      width: '130px',
    },
    {
      name: 'PRICE',
      prop: 'totalCost',
      type: 'uom',
      dataType: 'number',
      sortable: true,
      width: '140px',
    },
    {
      name: 'STATUS',
      prop: 'status',
      type: 'status',
      sortable: true,
      width: '120px',
    },
    {
      name: 'PAYMENT STATUS',
      prop: 'paymentStatus',
      type: 'status',
      sortable: true,
      width: '120px',
    },
    { name: 'ACTIONS', prop: 'action', type: 'menu', width: '100px' },
  ];

  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Order History',
      badge: 0,
      index: 0,
    },
  ];

  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];

  constructor(
    private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private formService: FormsService,
    public apiService: ApiService,
    public uomService: UomService
  ) {
  }

  ngOnInit(): void {
    this.getPreference();
    this.purchaseOrderService.loadPurchaseOrder.subscribe((res) => {
      if (res) {
        window.location.reload();
      }
    });
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
      this.loadAllOrders();
    });
  }

  changeMainTab(event: any) {
    this.currentMainIndex = event;
  }

  onInput(searchText): void {
    this.searchText = searchText;
    this.loadAllOrders();
  }

  loadAllOrders() {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.purchaseOrderService
      .Get_All_Order(
        this.searchText,
        this.pageS,
        this.pageIndex,
        this.sortQuery,
        uomQuery,
        this.filter
      )
      .subscribe((data) => {
        this.orders = data.content;
        this.orders.map((item) => {
          item.date = item.audit.createdDate;
          item.requestToName = item.requestTo.name;
          item.requestFromName = item.requestFrom.name;
          if (item.importLocalType == 'LOCAL') {
            item.incoTermDescription = item.deliveryPickup;
          }
          if (item.paymentStatus != 'COMPLETED' && item.status != 'DRAFT') {
            item.showPayNow = true;
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
        this.pageConfig.totalElements = data?.totalElements;
        this.pageConfig.totalPages = data?.totalPages;
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
            'home/quick-checkout/order/' + event.row.id
          );
        }
        break;
      case 'Pay now':
        break;
      case 'Download':
        break;
    }
  }

  editRecord(event): void {
    if (event?.data?.id) {
      this.router.navigateByUrl('home/quick-checkout/order/' + event.data.id);
    }
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadAllOrders();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadAllOrders();
  }

  loadOrderDetails(orderId: number) {
    this.router.navigateByUrl('home/quick-checkout/order/' + orderId);
  }

  copyOrderDetails(orders: any) {
    orders.id = null;
    orders.transactionId = null;
    for (let i = 0; i < orders.productPackages.length; i++) {
      orders.productPackages[i].id = null;
    }
    this.purchaseOrderService.Post_Order(orders).subscribe((data) => {
      this.loadAllOrders();
    });
  }
  navigateToOrder() {
    this.router.navigateByUrl('home/quick-checkout/order');
  } 
}
