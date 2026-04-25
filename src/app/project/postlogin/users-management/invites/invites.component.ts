import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InviteDialogComponent } from 'src/app/shared/component/invite-dialog/invite-dialog.component';
import { UsersManagementService } from '../services/users-management.service';
import { DataTableComponent } from '../../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../shared/component/search-filter/search-filter.component';

import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-invites',
    templateUrl: './invites.component.html',
    styleUrls: ['./invites.component.scss'],
    imports: [
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatTabContent,
        SearchFilterComponent,
        DadyinButtonComponent,
        DataTableComponent
    ]
})
export class InvitesComponent implements OnInit {
  dialog = inject(MatDialog);
  private userService = inject(UsersManagementService);

  currentTabIndex = 0;
  tabs = [
    { id: 'ALL', title: 'All invites', index: 0 },
    { id: 'ONBOARDED', title: 'Onboarded', index: 1 },
    { id: 'YET_TO_JOIN', title: 'Yet to join', index: 2 },
  ];

  allInvitesList: any[] = [];
  onboardedList: any[] = [];
  yetToJoinList: any[] = [];
  filterValue = '';
  pageIndex = 0;
  pageSize = 20;
  sortQuery = 'audit.createdDate,desc';
  pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
    totalElements: 0,
    totalPages: 0,
  };

  headers = [
    { name: 'Business Name', prop: 'name', sortable: true },
    { name: 'Business Email', prop: 'email', sortable: true },
    { name: 'Business Type', prop: 'businessType', sortable: true },
    { name: 'Industry', prop: 'industryType', sortable: true },
    { name: 'Status', prop: 'status', sortable: true },
    { name: 'Invited On', prop: 'invitedOn', type: 'date', sortable: true },
  ];

  ngOnInit(): void {
    this.loadList();
  }

  get currentList(): any[] {
    if (this.currentTabIndex === 0) return this.allInvitesList;
    if (this.currentTabIndex === 1) return this.onboardedList;
    return this.yetToJoinList;
  }

  get statusFilter(): string {
    return this.tabs[this.currentTabIndex]?.id || 'ALL';
  }

  loadList(): void {
    this.userService
      .getInvitesList(this.pageIndex, this.pageSize, this.sortQuery, this.statusFilter, this.filterValue || undefined)
      .subscribe((res) => {
        const list = res.content || [];
        const formatRow = (row: any) => ({
          ...row,
          email: row.email || row.primaryContact?.email,
          name: row.name || row.invitedTo,
          industryType: row.industryType || row.industryTypes?.[0] || row.productCategories?.[0],
          invitedOn: row.audit?.createdDate || row.invitedOn || row.createdDate,
          status: row.status || (row.inviteStatus ?? 'PENDING'),
        });
        if (this.currentTabIndex === 0) this.allInvitesList = list.map(formatRow);
        else if (this.currentTabIndex === 1) this.onboardedList = list.map(formatRow);
        else this.yetToJoinList = list.map(formatRow);
        this.pageConfig.totalElements = res.totalElements;
        this.pageConfig.totalPages = res.totalPages;
      });
  }

  onTabChange(event: any): void {
    this.currentTabIndex = event?.index ?? this.currentTabIndex;
    this.pageIndex = 0;
    this.loadList();
  }

  openInviteDialog(prefill?: any): void {
    const data: any = {
      redirectType: '',
      redirectReferenceId: '',
    };
    if (prefill) {
      data.invite = prefill;
      data.isSent = prefill.status === 'SENT' || prefill.inviteStatus === 'SENT';
    }
    const ref = this.dialog.open(InviteDialogComponent, {
      data,
      width: '50%',
    });
    ref.afterClosed().subscribe(() => this.loadList());
  }

  onSendNewInvite(): void {
    this.openInviteDialog();
  }

  onBulkInvite(): void {
    this.openInviteDialog();
  }

  onRowClick(event: any): void {
    const row = event?.data || event?.row || event;
    if (row) this.openInviteDialog(row);
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
    this.pageIndex = 0;
    this.loadList();
  }

  pageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadList();
  }

  sort(event: any): void {
    this.loadList();
  }

}
