import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UsersManagementService } from '../../../services/users-management.service';
import { InviteDialogComponent } from 'src/app/shared/component/invite-dialog/invite-dialog.component';
import { BusinessAccountService } from '../../../../business-account/business-account.service';
import { ToastrService } from 'ngx-toastr';
import { BulkAddDialogComponent } from 'src/app/project/postlogin/vendor-customer-management/shared/bulk-add-dialog/bulk-add-dialog.component';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-all-business-list',
    templateUrl: './all-business-list.component.html',
    styleUrls: ['./all-business-list.component.scss'],
    imports: [
        SearchFilterComponent,
        DadyinButtonComponent,
        DataTableComponent,
    ]
})
export class AllBusinessListComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  userService = inject(UsersManagementService);
  apiService = inject(ApiService);
  formService = inject(FormsService);
  http = inject(HttpClient);
  fb = inject(UntypedFormBuilder);
  dialog = inject(MatDialog);
  businessAccountService = inject(BusinessAccountService);
  private toastr = inject(ToastrService);

  public allBusinessList: any[] = [];
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
    { name: 'Total Purchase', prop: 'totalPurchaseMillion', sortable: true, subText: 'Millions', cellClass: 'text-danger' },
    { name: 'Subscription', prop: 'subscriptionPlan', sortable: true },
    { name: 'Exp Date', prop: 'subscriptionEnd', type: 'date', sortable: true },
    { name: 'Rating', prop: 'totalRating', sortable: true },
    { name: 'User Since', prop: 'userSince', sortable: true },
    { name: 'Last Login', prop: 'lastLoginTime', type: 'lastLogin', sortable: false },
  ];

  public tableActions: any = [{ label: 'Edit', icon: 'edit' }];
  pageIndex = 0;
  pageSize = 20;
  sortQuery = 'audit.lastModifiedDate,desc';
  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };

  ngOnInit(): void {
    this.businessAccountService.Get_All_employees();
    this.getBusinessList();
  }

  getBusinessList(): void {
    let filter = '';
    if (this.filterValue) {
      filter = `&searchString=${this.filterValue}`;
    }
    const pageSize = this.filterValue ? 10000 : this.pageSize;
    this.userService
      .getAllBusinessAccount(this.pageIndex, pageSize, this.sortQuery, filter)
      .subscribe((res) => {
        this.allBusinessList = res.content || [];
        this.allBusinessList.forEach((item) => {
          item.industryTypes =
            item.industryTypes ||
            item.productCategories ||
            item.relationIndustryTypes ||
            item.relationProductCategories;
          item.subscriptionPlan = `${item.subscriptionPlan || ''} (${item.subscriptionType || ''})`;
          item.totalPurchaseMillion = '$' + (item.totalPurchaseMillion ?? '');
          item.totalSellMillion = '$' + (item.totalSellMillion ?? '');
          item.totalTransactionMillion = '$' + (item.totalTransactionMillion ?? '');
          item.leadId = item.leadId ?? null;
        });
        this.pageConfig.totalElements = res?.totalElements;
        this.pageConfig.totalPages = res?.totalPages;
      });
  }

  onAddNewBusiness(): void {
    this.router.navigate(['/home/business-registration'], { queryParams: { new: 'true' } });
  }

  onInviteBusiness(): void {
    this.dialog
      .open(InviteDialogComponent, {
        data: { redirectType: '', redirectReferenceId: '' },
        width: '50%',
      })
      .afterClosed()
      .subscribe(() => this.getBusinessList());
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
    this.pageIndex = 0;
    this.getBusinessList();
  }

  viewRecord(event: any): void {
    const row = event?.data || event?.row;
    if (row) {
      this.dialog
        .open(InviteDialogComponent, {
          data: {
            redirectType: '',
            redirectReferenceId: '',
            invite: row,
            isSent: false,
          },
          width: '50%',
        })
        .afterClosed()
        .subscribe(() => this.getBusinessList());
    }
  }

  onActionClick(event: any): void {}

  sort(event: any): void {
    this.getBusinessList();
  }

  pageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getBusinessList();
  }

  onRowChange(event: { row: any; field: string; value: number | null }): void {
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

  onBulkAdd(): void {
    this.dialog.open(BulkAddDialogComponent, {
      width: '80%',
    }).afterClosed().subscribe(() => this.getBusinessList());
  }
}
