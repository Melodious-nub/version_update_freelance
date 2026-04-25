import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';

import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-rfq-list',
    templateUrl: './rfq-list.component.html',
    styleUrls: ['./rfq-list.component.scss'],
    imports: [
        SearchFilterComponent,
        DadyinButtonComponent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent
    ]
})
export class RfqListComponent implements OnInit {
  @Input() single = false;
  @Input() vendorId = null;
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public rfqsList: any[];
  public filterValue: string;
  public headers = [
    { name: 'DATE', prop: 'date', type: 'date', sortable: true },
    { name: 'RFQ#', prop: 'transactionId', sortable: true },
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
    { name: 'REFERENCES', prop: 'rfQuotationId', sortable: true },
    {
      name: 'REQ. BY DATE',
      prop: 'requiredByDate',
      type: 'date',
      sortable: true,
    },
    { name: 'RES. BY', prop: 'requestFromName', sortable: true },
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
    public fb: UntypedFormBuilder,
    public businessAccountService:BusinessAccountService
  ) {}

  ngOnInit() {
    this.getPreference();
  }

  loadRfqsList(): void {
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
      filter = `&filter=requestTo.id:${this.vendorId}`;
    }
    if (this.filterValue) {
      filter = filter + `&searchString=${this.filterValue}`;
    }
    if (this.businessAccountService.currentBusinessAccountId) {
      filter =
        filter +
        `&filter=requestFrom.id:${this.businessAccountService.currentBusinessAccountId}`;
    }
    this.orderApi
      .Get_All_Rfqs(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        filter
      )
      .subscribe((res) => {
        this.rfqsList = res.content;
        this.rfqsList.map((item) => (item.date = item.audit.createdDate));
        this.rfqsList.map((item) => (item.requestToName = item.requestTo.name));
        this.rfqsList.map(
          (item) => (item.requestFromName = item.requestFrom.name)
        );
        this.rfqsList.map((item) => {
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
            'home/order-management/' + this.role + '/rfq/edit/' + event.row.id
          );
        }
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  addRfq(): void {
    if (this.vendorId) {
      this.router.navigateByUrl(
        `'home/order-management/' + ${this.role} + '/rfq/add?vendorId=${this.vendorId}`
      );
    } else {
      this.router.navigateByUrl(
        'home/order-management/' + this.role + '/rfq/add'
      );
    }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
    this.loadRfqsList();
  }

  editRecord(event): void {
    this.router.navigateByUrl(
      'home/order-management/' + this.role + '/rfq/edit/' + event.data.id
    );
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadRfqsList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadRfqsList();
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForRfq = this.preferredUoms.find(
        (item) => item.componentType == 'ORDER'
      );
      preferenceForRfq?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForRfq);
      this.loadRfqsList();
    });
  }
}
