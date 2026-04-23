import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UntypedFormBuilder } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ApiService } from 'src/app/service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsermanagementService } from '../service/user-management.service';
import { DataTableComponent } from '../../../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../shared/component/search-filter/search-filter.component';
import { MatBadge } from '@angular/material/badge';
import { NgFor, NgIf } from '@angular/common';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-user-listing',
    templateUrl: './user-listing.component.html',
    styleUrls: ['./user-listing.component.scss'],
    standalone: true,
    imports: [
        MatTabGroup,
        NgFor,
        MatTab,
        MatTabLabel,
        MatBadge,
        MatTabContent,
        NgIf,
        SearchFilterComponent,
        DadyinButtonComponent,
        DataTableComponent,
    ],
})
export class UserListingComponent implements OnInit {
  public userListing: any[];

  public filterValue: string;
  public headers = [
    { name: 'USER ROLE', prop: 'requestToName', sortable: true },
    { name: '# OF USERS', prop: 'containerNumber', sortable: true },
    { name: '# OF ACCESS', prop: 'containerTypeDescription', sortable: true },
    { name: 'ACTIONS', prop: 'departureDate', sortable: true }
  ];
  public pageConfig = null;

  public tabelActions: any = [
    {
      label: 'Copy',
      icon: 'copy'
    },
    {
      label: 'Reply',
      icon: 'reply'
    },
    {
      label: 'Ban',
      icon: 'ban'
    },
  ];
  pageIndex: any = 0;
  pageS = 100;
  sortQuery: any = 'audit.lastModifiedDate,desc';
  currentMainIndex: number = 0;
  mainTab: Array<any> = [
    {
      id: 1,
      title: 'User Roles',
      badge: 0,
      index: 0,
    },
  ];
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public usermanagementService: UsermanagementService,
    public apiService: ApiService,
    public uomService: UomService,
    public formService: FormsService,
    public http: HttpClient,
    public fb: UntypedFormBuilder
  ) { }

  async ngOnInit() {
    this.pageConfig = {
      itemPerPage: 100,
      sizeOption: [50, 75, 100],
    };
  }




  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/system-config/user-management/edit/' + event.data.id
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

  editRecord(event): void {
    if (event?.data?.id) {
      this.router.navigateByUrl(
        'home/system-config/user-management/edit/' + event.data.id
      );
    }
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadUsersList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadUsersList();
  }


  loadUsersList() {

  }

  changeMainTab(event) {
    this.currentMainIndex = event;
  }

  navigateToAddUser() {
    this.router.navigateByUrl('home/system-config/user-management/add');
  }

}
