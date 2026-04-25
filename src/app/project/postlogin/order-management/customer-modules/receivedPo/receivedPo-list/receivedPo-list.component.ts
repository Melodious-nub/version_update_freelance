import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';

import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-receivedPo-list',
    templateUrl: './receivedPo-list.component.html',
    styleUrls: ['./receivedPo-list.component.scss'],
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
export class ReceivedPoListComponent implements OnInit {
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public receivedPosList: any[];
  public filterValue: string;
  public headers = [
    { name: 'DATE', prop: 'date', type: 'date', sortable: true },
    { name: 'PO#', prop: 'transactionId', sortable: true },
    { name: 'CUSTOMER NAME', prop: 'requestFromName', sortable: true },
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
      sortable: true,
    },
    { name: 'REQ. BY', prop: 'requiredByDate', type: 'date', sortable: true },
    { name: 'SALE BY', prop: 'saleBy', sortable: true },
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
  @Input('customerId') customerId: any = null;
  @Input() single = false;

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public orderApi: OrderManagementService,
    public apiService: ApiService,
    public uomService: UomService,
    public formService: FormsService,
    public http: HttpClient,
    public fb: UntypedFormBuilder
  ) {}

  ngOnInit() {
    this.getPreference();
  }

  loadReceivedPosList(): void {
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
    if (this.customerId) {
      filter = `&filter=requestFrom.id:${this.customerId}`;
    }
    if (this.filterValue) {
      filter = filter + `&searchString=${this.filterValue}`;
    }
    this.orderApi
      .Get_All_ReceivedPOs(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        filter
      )
      .subscribe((res) => {
        this.receivedPosList = res.content;
        this.receivedPosList.map(
          (item) => (item.date = item.audit.createdDate)
        );
        this.receivedPosList.map((item) =>
          item.isQuickCheckout ? (item.saleBy = 'QC') : (item.saleBy = '')
        );
        this.receivedPosList.map(
          (item) => (item.requestFromName = item?.requestFrom?.name)
        );
        this.receivedPosList.map(
          (item) => (item.requestToName = item?.requestTo?.name)
        );
        this.receivedPosList.map((item) => {
          if (item.importLocalType == 'LOCAL') {
            item.incoTermDescription = item.deliveryPickup;
          }
        });

        // this.receivedPosList.map((item) => {
        //   if (item?.buyingType == 'CONTAINER_20_FT') {
        //     item.buyingType = '20_FT';
        //   }
        //   if (item?.buyingType == 'CONTAINER_40_FT') {
        //     item.buyingType = '40_FT';
        //   }
        //   if (item?.buyingType == 'CONTAINER_40_FT_HQ') {
        //     item.buyingType = '40_FT_HQ';
        //   }
        // });

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
          if (this.isCustomer) {
            this.router.navigateByUrl(
              'home/order-management/customer/receivedPo/edit/' + event.row.id
            );
          } else {
            this.router.navigateByUrl(
              'home/order-management/vendor/steps/' +
                event.row.id +
                '?currentStepIndex=2'
            );
          }
        }
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  addReceivedPo(): void {
    if (this.customerId) {
      this.router.navigateByUrl(
        `home/order-management/customer/receivedPo/add?customerId=${this.customerId}`
      );
    } else {
      this.router.navigateByUrl(
        'home/order-management/customer/receivedPo/add'
      );
    }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
    this.loadReceivedPosList();
  }

  editRecord(event): void {
    if (this.isCustomer) {
      this.router.navigateByUrl(
        'home/order-management/customer/receivedPo/edit/' + event.data.id
      );
    } else {
      this.router.navigateByUrl(
        'home/order-management/vendor/steps/' +
          event.data.id +
          '?currentStepIndex=2'
      );
    }
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadReceivedPosList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadReceivedPosList();
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForReceivedPo = this.preferredUoms.find(
        (item) => item.componentType == 'ORDER'
      );
      preferenceForReceivedPo?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForReceivedPo);
      this.loadReceivedPosList();
    });
  }

  get isCustomer() {
    if (window.location.href.includes('customer')) {
      return true;
    } else {
      return false;
    }
  }
}
