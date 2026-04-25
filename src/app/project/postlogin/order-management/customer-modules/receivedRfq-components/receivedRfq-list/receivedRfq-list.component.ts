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
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-received-rfq-list',
    templateUrl: './receivedRfq-list.component.html',
    styleUrls: ['./receivedRfq-list.component.scss'],
    imports: [
        SearchFilterComponent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent
    ]
})
export class ReceivedRfqListComponent implements OnInit {
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public receivedEnquiriesList: any[];
  public filterValue: string;
  public headers = [
    { name: 'DATE', prop: 'date', type: 'date', sortable: true },
    { name: 'REC. RFQ#', prop: 'transactionId', sortable: true },
    { name: 'CUSTOMER NAME', prop: 'requestFromName', sortable: true },
    { name: 'CONTACT', prop: 'contactPhone', sortable: true },
    { name: 'INCOTERMS', prop: 'incoTermDescription', sortable: true },
    { name: 'BUYING TYPE', prop: 'buyingType', sortable: true },
    { name: 'PRODUCT #', prop: 'quantity', sortable: true },
    { name: 'SKU#', prop: 'totalSku', sortable: true },
    { name: 'QUOTE#', prop: 'rfQuotationId', sortable: true },
    {
      name: 'REQ. BY',
      prop: 'requiredByDate',
      type: 'date',
      sortable: true,
    },
    {
      name: 'RAISED',
      prop: 'requiredByName',
      sortable: true,
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
  @Input() role: any;
  @Input() single = false;
  @Input('customerId') customerId: any = null;

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

  loadReceivedEnquiryList(): void {
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
      filter = `&filter=requestTo.id:${this.customerId}`;
    }
    if (this.filterValue) {
      filter = filter + `&searchString=${this.filterValue}`;
    }
    this.orderApi
      .Get_All_RecEnquiries(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        filter
      )
      .subscribe((res) => {
        this.receivedEnquiriesList = res.content;
        this.receivedEnquiriesList.map((item) => {
          item.date = item.audit?.createdDate;
          item.requestToName = item.requestTo.name;
          item.requestFromName = item.requestFrom.name;
        });
        this.receivedEnquiriesList.map((item) => {
          if (item.importLocalType == 'LOCAL') {
            item.incoTermDescription = item.deliveryPickup;
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
            'home/order-management/' +
              this.role +
              '/receivedRfq/view/' +
              event.row.id
          );
        }
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
  }

  viewRecord(event): void {
    this.router.navigateByUrl(
      'home/order-management/' +
        this.role +
        '/receivedRfq/view/' +
        event.data.id
    );
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadReceivedEnquiryList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadReceivedEnquiryList();
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForQuotation = this.preferredUoms.find(
        (item) => item.componentType == 'ORDER'
      );
      preferenceForQuotation?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForQuotation);
      this.loadReceivedEnquiryList();
    });
  }

  addRfq() {
    this.router.navigateByUrl('home/order-management/customer/receivedRfq/add');
  }
}
