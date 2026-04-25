import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from '../../../../business-account/business-account.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { InvoiceManagementService } from '../invoice-management.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';

import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';
@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.component.html',
    styleUrls: ['./invoice-list.component.scss'],
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
export class InvoiceListComponent implements OnInit {
  @Input('single') single = false;
  invoiceList: any[];
  public searchText: string;
  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'date,desc';
  public headers = [
    { name: 'INVOICE DATE', type: 'date', prop: 'date', sortable: true },
    { name: 'BILL#', prop: 'transactionId', sortable: true },
    { name: 'CREATED DATE', type: 'date', prop: 'createdDate', sortable: true },
    { name: 'CUSTOMER NAME', prop: 'customerName', sortable: true },
    {
      name: 'PAYMENT AMOUNT',
      prop: 'totalCost',
      type: 'uom',
      dataType: 'number',
      sortable: true,
    },
    { name: 'PAYMENT TYPE', prop: 'type', sortable: true },
    {
      name: 'PAYMENT STATUS',
      prop: 'paymentStatus',
      type: 'status',
      sortable: true,
    },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];
  currentBusinessAccount;

  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();

  constructor(
    public router: Router,
    public apiService: ApiService,
    private businessAccount: BusinessAccountService,
    public orderManagementService: OrderManagementService,
    public invoiceManagementService: InvoiceManagementService,
    public formsService: FormsService,
    public uomService: UomService
  ) {
    this.businessAccount.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
      if (this.currentBusinessAccount) {
        this.getPreference();
      }
    });
  }

  ngOnInit() {}
  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForQuotation = this.preferredUoms.find(
        (item) => item.componentType == 'ORDER'
      );
      preferenceForQuotation?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForQuotation);
      this.getInvoices();
    });
  }
  getInvoices(): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    let invoiceRequest: any = {};
    invoiceRequest.pageIndex = this.pageIndex;
    invoiceRequest.pageS = this.pageS;
    invoiceRequest.sortQuery = this.sortQuery;
    invoiceRequest.uomQuery = encodeURI(uomQuery);
    invoiceRequest.filter = `requestFrom.id:${this.currentBusinessAccount?.id}`;
    this.invoiceManagementService
      .getInvoicesListForCustomer(invoiceRequest)
      .subscribe((res: any) => {
        const result = res.content;
        result.forEach((element) => {
          const name = element.requestFrom?.name
          if (name) {
            element.customerName = name?.includes(',') ? name.split(',')[0] : name;
          } else {
            element.customerName = '';
          }
        })
        this.invoiceList = result;
        this.pageConfig.totalElements = res?.totalElements;
        this.pageConfig.totalPages = res?.totalPages;
      });
  }

  addInvoice(): void {
    this.router.navigateByUrl('home/order-management/customer/invoice/add');
  }

  onInput(searchText: string): void {
    this.searchText = searchText;
    this.getInvoices();
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.getInvoices();
    }
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/order-management/customer/invoice/edit/' + event?.row?.id
          );
        }
        break;
    }
  }
  onEditClick(event) {
    this.router.navigateByUrl(
      'home/order-management/customer/invoice/edit/' + event?.data?.id
    );
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.getInvoices();
  }
}
