import { HttpClient } from '@angular/common/http';
import { Component, Input,  OnInit } from '@angular/core';
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
    selector: 'app-quotation-list',
    templateUrl: './quotation-list.component.html',
    styleUrls: ['./quotation-list.component.scss'],
    imports: [
        SearchFilterComponent,
        DadyinButtonComponent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent
    ]
})
export class QuotationListComponent implements OnInit {
  @Input() single = false;
  @Input('customerId') customerId: any = null;
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public quotationsList: any[];
  public filterValue: string;
  public headers = [
    { name: 'DATE', prop: 'date', type: 'date', sortable: true },
    { name: 'QUOTATION#', prop: 'transactionId', sortable: true },
    { name: 'CUSTOMER NAME', prop: 'requestToName', sortable: true },
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
      name: 'PRICE',
      prop: 'totalCost',
      type: 'uom',
      dataType: 'number',
      sortable: true,
    },
    { name: 'REQ. BY', prop: 'requiredByDate', type: 'date', sortable: true },
    { name: 'D POINTS', prop: 'dadyInPoints', sortable: true },
    { name: 'REQ. BY', prop: 'requestFromName', sortable: true },
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
  searchString: any;

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
    public fb: UntypedFormBuilder
  ) {}

  ngOnInit() {
    this.getPreference();
  }

  loadQuotationsList(): void {
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
      .Get_All_Quotations(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        filter
      )
      .subscribe((quotations) => {
        this.quotationsList = quotations.content;
        this.quotationsList.map((item) => {
          item.date = item.audit.createdDate;
          item.requestFromName = item.requestFrom.name;
          item.requestToName = item.requestTo.name;
        });
        this.quotationsList.map((item) => {
          if (item.importLocalType == 'LOCAL') {
            item.incoTermDescription = item.deliveryPickup;
          }
        });
        this.pageConfig.totalElements = quotations?.totalElements;
        this.pageConfig.totalPages = quotations?.totalPages;
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
              '/quotation/edit/' +
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

  addQuotation(): void {
    if (this.customerId) {
      this.router.navigateByUrl(
        `home/order-management/customer/quotation/add?customerId=${this.customerId}`
      );
    } else {
      this.router.navigateByUrl('home/order-management/customer/quotation/add');
    }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
    this.loadQuotationsList();
  }

  editRecord(event): void {
    this.router.navigateByUrl(
      'home/order-management/customer/quotation/edit/' + event.data.id
    );
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadQuotationsList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadQuotationsList();
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
      this.loadQuotationsList();
    });
  }
}
