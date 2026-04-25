import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';

import { CdkDrag } from '@angular/cdk/drag-drop';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-receivedquotation-list',
    templateUrl: './receivedquotation-list.component.html',
    styleUrls: ['./receivedquotation-list.component.scss'],
    imports: [
        SearchFilterComponent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent
    ]
})
export class ReceivedquotationListComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  orderApi = inject(OrderManagementService);
  apiService = inject(ApiService);
  uomService = inject(UomService);
  formService = inject(FormsService);
  http = inject(HttpClient);
  fb = inject(UntypedFormBuilder);
  businessAccountService = inject(BusinessAccountService);

  @Input() single = false;
  @Input() vendorId = null;
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public quotationsList: any[];
  public filterValue: string;
  public headers = [
    { name: 'DATE', prop: 'date', type: 'date', sortable: true },
    { name: 'REC. QUOTATION#', prop: 'transactionId', sortable: true },
    { name: 'VENDOR NAME', prop: 'requestFromName', sortable: true },
    { name: 'CONTACT', prop: 'contactPhone', sortable: true },
    { name: 'INCOTERM', prop: 'incoTermDescription', sortable: true },
    { name: 'BUYING TYPE', prop: 'buyingType', sortable: true },
    { name: 'PRODUCT#', prop: 'noOfProductsInOrder', sortable: true },
    { name: 'SKU#', prop: 'totalSku', sortable: true },
    { name: 'PO#', prop: 'saleOrderTransactionId', sortable: true },
    {
      name: 'REQ. BY DATE',
      prop: 'requiredByDate',
      type: 'date',
      sortable: true,
    },
    { name: 'PRICE', prop: 'totalCost',type:'uom',dataType: 'number', sortable: true },
    { name: 'RAISED BY', prop: 'createdByUserName', sortable: true },
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
    if(this.businessAccountService.currentBusinessAccountId){
      filter =filter + `&filter=requestTo.id:${this.businessAccountService.currentBusinessAccountId}`;
    }
    if (this.filterValue) {
      filter = filter + `&searchString=${this.filterValue}`;
    }
  
    this.orderApi
      .Get_All_RecQuotations(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        filter
      )
      .subscribe((quotations) => {
        this.quotationsList = quotations.content;
        this.quotationsList.map((item) => {
          item.date = item.audit?.createdDate;
          item.requestFromName = item.requestFrom?.name;
          item.requestToName = item.requestTo?.name;
          item.createdByUserName=item.audit?.createdByUserName
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
            'home/order-management/vendor/receivedquotation/view/' +
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
    this.loadQuotationsList();
  }

  editRecord(event): void {
    this.router.navigateByUrl(
      'home/order-management/vendor/receivedquotation/view/' + event.data.id
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
