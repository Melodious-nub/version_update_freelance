import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UsersManagementService } from '../../../services/users-management.service';
import { BusinessAccountService } from '../../../../business-account/business-account.service';
import { ToastrService } from 'ngx-toastr';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-active-business-list',
    templateUrl: './active-business-list.component.html',
    styleUrls: ['./active-business-list.component.scss'],
    standalone: true,
    imports: [SearchFilterComponent, DataTableComponent]
})
export class ActiveBusinessListComponent implements OnInit {
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public allBusinessList: any[];
  public filterValue: string;
  public headers = [
    { name: 'Business Id', prop: 'id', sortable: true },
    { name: 'Business Name', prop: 'name', sortable: true, type: 'businessNameWithStatus' },
    { name: 'Town | State | Country', prop: 'address', sortable: true },
    { name: 'Business Type', prop: 'businessType', sortable: true },
    { name: 'Industry/Retail Type', prop: 'industryTypes', sortable: true },
    {
      name: 'Sales Rep',
      prop: 'leadId',
      type: 'updateBusinessLead',
      minWidth: '200px',
      maxWidth: '200px',
    },
    { name: 'As Customer', prop: 'asCustomer', sortable: true },
    { name: 'As Vendor', prop: 'asVendor', sortable: true },
    { name: 'Turnover', prop: 'totalTransactionMillion', sortable: true, subText: 'Millions', cellClass: 'price-text' },
    { name: 'Total Sales', prop: 'totalSellMillion', sortable: true, subText: 'Millions', cellClass: 'price-text' },
    {
      name: 'Total Purchase',
      prop: 'totalPurchaseMillion',
      sortable: true,
      subText: 'Millions',
      cellClass: 'text-danger'
    },
    { name: 'Subscription', prop: 'subscriptionPlan', sortable: true },
    { name: 'Exp Date', prop: 'subscriptionEnd', type: 'date', sortable: true },
    { name: 'Rating', prop: 'totalRating', sortable: true },
    { name: 'User Since', prop: 'userSince', sortable: true },
    { name: 'Last Login', prop: 'lastLoginTime', type: 'lastLogin', sortable: false },
    // { name: 'ACTIONS', prop: 'action', type: 'menu' },
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
    public userService: UsersManagementService,
    public apiService: ApiService,
    public formService: FormsService,
    public http: HttpClient,
    public fb: UntypedFormBuilder,
    public businessAccountService: BusinessAccountService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.businessAccountService.Get_All_employees();
    this.getBusinessList();
  }

  getBusinessList(): void {
    let filter = '';
    if (this.customerId) {
      filter = `&filter=requestTo.id:${this.customerId}`;
    }
    if (this.filterValue) {
      filter = filter + `&searchString=${this.filterValue}`;
    }
    const pageSize = this.filterValue ? 10000 : this.pageS;
    this.userService
      .getAllBusinessAccount(
        this.pageIndex,
        pageSize,
        this.sortQuery,
        filter
      )
      .subscribe((res) => {
        this.allBusinessList = res.content;
        this.allBusinessList.map((item) => {
          item.industryTypes = item.industryTypes || item.productCategories || item.relationIndustryTypes || item.relationProductCategories;
          item.subscriptionPlan = `${item.subscriptionPlan} (${item.subscriptionType})` ;
          item.totalPurchaseMillion = '$' + item.totalPurchaseMillion;
          item.totalSellMillion = '$' + item.totalSellMillion;
          item.totalTransactionMillion = '$' + item.totalTransactionMillion;
          item.leadId = item.leadId ?? null;
        });
        this.pageConfig.totalElements = res?.totalElements;
        this.pageConfig.totalPages = res?.totalPages;
      });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  onActionClick(event) {
    // switch (event.action.label) {
    //   case 'Edit':
    //     if (event?.row?.id) {
    //       this.router.navigateByUrl(
    //         'home/order-management/' +
    //         this.role +
    //         '/receivedRfq/view/' +
    //         event.row.id
    //       );
    //     }
    //     break;
    // }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
  }

  viewRecord(event): void {
    // this.router.navigateByUrl(
    //   'home/order-management/' +
    //   this.role +
    //   '/receivedRfq/view/' +
    //   event.data.id
    // );
  }

  sort(event) {
    this.getBusinessList();
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.getBusinessList();
  }

  onRowChange(event: { row: any; field: string; value: number | null }) {
    if (event.field === 'leadId' && event.row?.id != null) {
      this.userService
        .updateBusinessLead(event.row.id, event.value)
        .subscribe({
          next: () => {
            event.row.leadId = event.value;
            this.toastr.success('Sales rep updated');
          },
          error: () => this.toastr.error('Failed to update sales rep'),
        });
    }
  }
}
