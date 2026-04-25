import { Component, OnInit, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from '../business-account/business-account.service';
import { ToastrService } from 'ngx-toastr';
import { NoteDialogComponent } from './shared/note-dialog/note-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { VendorCustomerService } from './service/vendor-customer.service';
import { VendorFormsService } from './service/vendor-forms.service';
import { UntypedFormBuilder, UntypedFormControl, FormsModule } from '@angular/forms';
import { sidebarMenu } from 'src/app/shared/menuconstant';
import { SelectMenuService } from 'src/app/layout/select-menu.service';
import { AuthService } from 'src/app/service/auth.service';
import { TokenService } from 'src/app/service/token.service';
import { DataTableComponent } from 'src/app/shared/component/data-table/data-table.component';
import { PdfGeneratorService } from 'src/app/service/pdf-generator.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { selectSalesRepDialogComponent } from './shared/select-salesrep-dialog/select-salesrep-dialog.component';
import {  BulkAddDialogComponent } from './shared/bulk-add-dialog/bulk-add-dialog.component';
import { BusinessEntityConfigurationComponent } from '../system-config-management/business-entity-configuration/business-entity-configuration.component';
import { SystemConfigService } from '../system-config-management/service/system-config.service';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { MatTooltip } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { LeadFilterBoxComponent } from './shared/lead-filter-box/lead-filter-box.component';
import { DataTableComponent as DataTableComponent_1 } from '../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../shared/component/search-filter/search-filter.component';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';
import { NgClass, SlicePipe } from '@angular/common';

@Component({
    selector: 'app-vendor-customer-management',
    templateUrl: './vendor-customer-management.component.html',
    styleUrls: ['./vendor-customer-management.component.scss'],
    imports: [
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatTabContent,
        SearchFilterComponent,
        DadyinButtonComponent,
        DataTableComponent_1,
        LeadFilterBoxComponent,
        NgSelectModule,
        FormsModule,
        MatTooltip,
        NgClass,
        ExtendedModule,
        SlicePipe
    ]
})
export class VendorCustomerManagementComponent implements OnInit {
  apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  businessAccountService = inject(BusinessAccountService);
  vendorCustomerService = inject(VendorCustomerService);
  toastr = inject(ToastrService);
  dialog = inject(MatDialog);
  vendorFormService = inject(VendorFormsService);
  fb = inject(UntypedFormBuilder);
  selectMenuService = inject(SelectMenuService);
  tokenService = inject(TokenService);
  pdfGeneratorService = inject(PdfGeneratorService);
  private systemConfigService = inject(SystemConfigService);

  readonly dataTable = viewChild.required(DataTableComponent);
  employeeId = null;
  productCategoryId = null;
  edit = false;
  public currentMainIndex: number = 0;
  public pageConfig = null;
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'id,desc';
  empName: any;
  public vendorDetails: any = [];
  public leadDetails: any = [];
  public prospectDetails: any = [];
  public headers = [];

  public businessAccounts: any[] = [];
  public customerDetails: any = [];
  searchText: any = '';
  mainTabVendors: Array<any> = [];
  mainTabCustomers: Array<any> = [];
  public tableActions: any = [
    { label: 'Accept', icon: 'task_alt' },
    { label: 'Reject', icon: 'cancel' },
    { label: 'Edit', icon: 'edit' },
    { label: 'Quick Quotation', icon: 'request_quote' },
  ];

  public tableActionCustomers: any = [
    { label: 'Accept', icon: 'task_alt' },
    { label: 'Reject', icon: 'cancel' },
    { label: 'Edit', icon: 'edit' },
    { label: 'Quick Quotation', icon: 'request_quote' },
    { label: 'Rec. PO', icon: 'request_quote' },
    { label: 'Quotation', icon: 'request_quote' },
    { label: 'Invoice', icon: 'request_quote' },
  ];

  public tableActionLeads: any = [
    { label: 'Convert to Prospect', icon: 'group_add' },
    { label: 'Upload Note Image', icon: 'image' },
    { label: 'Edit', icon: 'edit' },
  ];

  public tableActionProspects: any = [
    { label: 'Convert to Customer', icon: 'group_add' },
    { label: 'Edit', icon: 'edit' },
  ];

  public tableActionsVendor: any = [
    { label: 'Quick Checkout', icon: 'shopping_cart_checkout' },
    { label: 'Accept', icon: 'task_alt' },
    { label: 'Reject', icon: 'cancel' },
    { label: 'Edit', icon: 'edit' },
  ];

  city = new UntypedFormControl();
  currentUser: any;
  bulkAssignmentIds = [];
  bulkAssignmentData = [];
  salesRepIds = [];
  relationStatusId = null;
  unassignedFilter = false;
  lcpDetails: any[] = [];

  /** Sub-tabs within Leads: All, Unassigned, Assigned, Converted */
  currentLeadTabIndex = 0;
  leadSubTabs: Array<{ id: string; label: string; index: number }> = [
    { id: 'ALL', label: 'All', index: 0 },
    { id: 'UNASSIGNED', label: 'Unassigned', index: 1 },
    { id: 'ASSIGNED', label: 'Assigned', index: 2 },
    { id: 'CONVERTED', label: 'Converted', index: 3 },
  ];

  constructor() {
    this.initializeTabs();
    // if (tokenService?.getRoleInBusinessAccountIdToken() == 'CRM') {
    //   this.currentMainIndex = 2;
    // }
  }

  ngOnInit(): void {
    this.authService.$currentUser.subscribe((res) => {
      this.currentUser = res;
      this.employeeId = this.currentUser.employeeId;
    });
    this.apiService.Get_Relation_Status();
    this.businessAccountService.Get_All_employees();
    this.pageConfig = {
      itemPerPage: 20,
      sizeOption: [20, 50, 75, 100],
    };
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.currentStepIndex) {
        this.currentMainIndex =
          this.route.snapshot.queryParams.currentStepIndex;
      }
      if (this.router.url.includes('users-management') && this.isCustomer) {
        this.currentMainIndex = 2;
      }
      if (queryParams.assignedSalesId) {
        this.salesRepIds.push(
          Number(this.route.snapshot.queryParams.assignedSalesId)
        );
      }
      if (queryParams.employeeId) {
        this.employeeId = queryParams.employeeId;
      }
      if (queryParams.productCategoryId) {
        this.productCategoryId = queryParams.productCategoryId;
      }
      this.loadListing();
    });
  }

  initializeTabs() {
    const customerItem = sidebarMenu.find((item) => item.label == 'Customer');
    const customerChilds = this.router.url.includes('users-management')
      ? customerItem.childs.filter((c) => c.label === 'Leads')
      : customerItem.childs;
    customerChilds.forEach((element) => {
      this.mainTabCustomers.push(element);
    });
    const vendorItem = sidebarMenu.find((item) => item.label == 'Vendor');
    vendorItem.childs.forEach((element) => {
      this.mainTabVendors.push(element);
    });
  }

  /** When in users-management, only Leads tab exists (index 0) */
  get customerTabSelectedIndex(): number {
    if (this.router.url.includes('users-management')) {
      return 0;
    }
    return this.currentMainIndex;
  }

  loadListing() {
    if (this.isCustomer) {
      this.loadCustomerHeaders();
      if (this.currentMainIndex == 0) {
        this.loadlcpDetails();
      }
      if (this.currentMainIndex == 1) {
        this.loadCustomerDetails();
      } else if (this.currentMainIndex == 2) {
        this.loadLeadDetails();
      } else if (this.currentMainIndex == 3) {
        this.loadProspectDetails();
      }
    } else {
      this.loadVendorHeaders();
      this.loadVendorDetails();
    }
  }

  loadCustomerHeaders() {
    if (this.currentMainIndex == 0) {
      this.headers = [
        {
          name: 'BUS. CAT.',
          prop: 'businessCategory',
          type: 'businessCategory',
          maxWidth: '70px',
          sortable: true,
        },
        { name: 'CODE', prop: 'code', sortable: true },
        {
          name: 'NAME',
          prop: 'relationAccountName',
          maxWidth: '200px',
          sortable: true,
        },
        { name: 'ADDRESS', prop: 'addressLine', type: 'addressLine' },
        {
          name: 'RELATION TYPE',
          prop: 'businessLine',
          sortable: true,
          maxWidth: '120px',
        },
        {
          name: 'ADDED ON',
          prop: 'createdDate',
          type: 'date',
          sortable: true,
          maxWidth: '100px',
        },
        { name: 'CONTACT', prop: 'phoneNumber' },
        {
          name: 'SALES REP',
          prop: 'assignedSalesId',
          type: 'updateSalesrep',
          minWidth: '200px',
          maxWidth: '200px',
        },
        {
          name: 'ACTIONS',
          prop: 'action',
          type: 'menu',
          minWidth: '180px',
          maxWidth: '180px',
        },
      ];
    }
    if (this.currentMainIndex == 1) {
      this.headers = [
        { name: '', prop: 'select', sortable: false, maxWidth: '30px' },
        { name: 'CODE', prop: 'code', sortable: true },
        {
          name: 'NAME',
          prop: 'relationAccountName',
          maxWidth: '200px',
          sortable: true,
        },
        { name: 'ADDRESS', prop: 'addressLine', type: 'addressLine' },
        {
          name: 'RELATION TYPE',
          prop: 'businessLine',
          sortable: true,
          maxWidth: '120px',
        },
        {
          name: 'ADDED ON',
          prop: 'createdDate',
          type: 'date',
          sortable: true,
          maxWidth: '100px',
        },
        { name: 'CONTACT', prop: 'phoneNumber' },
        {
          name: 'SALES REP',
          prop: 'assignedSalesId',
          type: 'updateSalesrep',
          minWidth: '200px',
          maxWidth: '200px',
        },
        {
          name: 'ACTIONS',
          prop: 'action',
          type: 'menu',
          minWidth: '180px',
          maxWidth: '180px',
        },
      ];
    } else if (this.currentMainIndex == 2) {
      this.headers = [
        { name: '', prop: 'select', sortable: false, maxWidth: '30px' },
        {
          name: 'NAME',
          prop: 'relationAccountName',
          type: 'addressHover',
      
          sortable: true,
        },
        {
          name: 'CITY',
          prop: 'addressCity',
          maxWidth: '100px',
          sortable: true,
        },
        {
          name: 'ZIPCODE',
          prop: 'addressZipCode',
          maxWidth: '100px',
          sortable: true,
        },
        { name: 'CONTACT', prop: 'phoneNumber', maxWidth: '100px' },
        {
          name: 'REM. DETAILS',
          prop: 'reminderDetails',
          type: 'reminderDetails',
          sortable: true,
          minWidth: '230px',
          maxWidth: '230px',
        },
        {
          name: 'NOTES',
          prop: 'latestNote',
          type: 'viewnote',
          maxWidth: '550px',
          minWidth: '120px',
        },
        {
          name: 'STATUS',
          sortable: true,
          minWidth: '150px',
          maxWidth: '150px',
          prop: 'relationStatusId',
          type: 'updateStatus',
        },
        {
          name: 'SALES REP',
          prop: 'assignedSalesId',
          type: 'updateSalesrep',
          minWidth: '200px',
          maxWidth: '200px',
        },
        {
          name: 'ACTIONS',
          prop: 'action',
          type: 'menu',
          minWidth: '180px',
          maxWidth: '180px',
        },
      ];
      if (this.tokenService.getRoleInBusinessAccountIdToken() == 'CRM') {
        this.headers.splice(8, 1);
      }
    } else if (this.currentMainIndex == 3) {
      this.headers = [
        { name: '', prop: 'select', sortable: false, maxWidth: '30px' },
        {
          name: 'NAME',
          prop: 'relationAccountName',
          type: 'addressHover',
          maxWidth: '130px',
          sortable: true,
        },
        {
          name: 'CITY',
          prop: 'addressCity',
          maxWidth: '100px',
          sortable: true,
        },
        {
          name: 'ZIPCODE',
          prop: 'addressZipCode',
          maxWidth: '100px',
          sortable: true,
        },
        { name: 'CONTACT', prop: 'phoneNumber' },
        {
          name: 'REM. DETAILS',
          prop: 'reminderDetails',
          type: 'reminderDetails',
          sortable: true,
          minWidth: '200px',
        },
        {
          name: 'NOTES',
          prop: 'latestNote',
          type: 'viewnote',
          maxWidth: '450px',
          minWidth: '120px',
        },
        {
          name: 'STATUS',
          sortable: true,
          prop: 'relationStatusId',
          type: 'updateStatus',
        },
        {
          name: 'SALES REP',
          prop: 'assignedSalesId',
          maxWidth: '110px',
          type: 'updateSalesrep',
        },
        {
          name: 'ACTIONS',
          prop: 'action',
          type: 'menu',
          minWidth: '180px',
          maxWidth: '180px',
        },
      ];
      if (this.tokenService.getRoleInBusinessAccountIdToken() == 'CRM') {
        this.headers.splice(8, 1);
      }
    }
  }

  loadVendorHeaders() {
    this.headers = [
      { name: 'VENDOR CODE', prop: 'code', sortable: true },
      { name: 'VENDOR NAME', prop: 'relationAccountName', sortable: true },
      { name: 'CONTACT', prop: 'phoneNumber' },
      { name: 'ADDRESS', type: 'addressLine', prop: 'addressLine' },
      { name: 'ORDERS', prop: 'sortOrder' },
      { name: 'PURCHASE MANAGER', prop: 'assignedTo' },
      {
        name: 'NOTES',
        prop: 'latestNote',
        type: 'viewnote',
        maxWidth: '550px',
        minWidth: '120px',
      },
      {
        name: 'POINT RATE',
        prop: 'pointRate',
        dataType: 'number',
        sortable: true,
      },
      { name: 'AP', prop: 'accountReceivable' },
      { name: 'ADDED ON', prop: 'createdDate', type: 'date', sortable: true },
      {
        name: 'LAST UPDATED',
        prop: 'lastModifiedDate',
        type: 'date',
        sortable: true,
      },

      {
        name: 'ACTIONS',
        prop: 'action',
        type: 'menu',
        minWidth: '120px',
        maxWidth: '120px',
      },
    ];
  }

  loadVendorDetails() {
    this.apiService
      .Get_All_Vendors(
        this.searchText,
        this.pageIndex,
        this.pageS,
        this.sortQuery
      )
      .subscribe((data) => {
        this.vendorDetails = data?.content;
        this.pageConfig.totalElements = data?.totalElements;
        this.pageConfig.totalPages = data?.totalPages;
        this.vendorDetails.map((item) => {
          item.phoneNumber = item.phone?.number;
          item.addressLine = this.formatAddress(item.address);
          item.showResendInviteButton = this.checkInviteDate(
            item.inviteCreatedDate
          );
          item.showInwardArrow = item?.relationAcceptedStatus == 'PENDING';
          item.showOutwardArrow =
            item?.reverseRelationAcceptedStatus == 'PENDING';
          item.showAcceptRelationButton =
            item?.relationAcceptedStatus == 'PENDING';
          item.showRejectRelationButton =
            item?.relationAcceptedStatus == 'PENDING';
          item.createdDate = item?.audit?.createdDate.split('T')[0];
          item.lastModifiedDate = item?.audit?.lastModifiedDate.split('T')[0];
        });
      });
  }

  formatAddress(address: any) {
    return `${address?.addressLine ?? ''}${
      address?.addressCity ? ',' + address?.addressCity : ''
    }${address?.addressState ? ',' + address?.addressState : ''}${
      address?.addressCountry ? ',' + address?.addressCountry : ''
    }${address?.addressZipCode ? ',' + address?.addressZipCode : ''}`;
  }

  checkInviteDate(date: any) {
    if (!date) {
      return false;
    }
    const today = new Date();
    const inputDateObj = new Date(date);
    const differenceInMilliseconds = today.getTime() - inputDateObj.getTime();
    const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);
    return differenceInDays > 30;
  }

  /** Filter string for the current Leads sub-tab (All, Unassigned, Assigned, Converted) */
  getLeadFilterQuery(): string {
    switch (this.currentLeadTabIndex) {
      case 1:
        return 'assignedSalesId IS NULL';
      case 2:
        return 'assignedSalesId IS NOT NULL';
      case 3:
        return ''; // Converted: add backend filter if needed, e.g. relationStatusId or converted flag
      default:
        return '';
    }
  }

  changeLeadSubTab(index: number) {
    this.currentLeadTabIndex = index;
    this.pageIndex = 0;
    this.unassignedFilter = index === 1;
    this.loadLeadDetails(this.getLeadFilterQuery());
  }

  loadLeadDetails(filterQuery?: any) {
    if (this.currentMainIndex === 2 && filterQuery === undefined) {
      filterQuery = this.getLeadFilterQuery();
    }
    filterQuery = filterQuery || '';
    if (this.productCategoryId) {
      filterQuery = `&filter=productCategoryIdList~'*%23${this.productCategoryId}%23*'`;
    }
    this.apiService
      .Get_All_Leads(
        this.searchText,
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        this.employeeId,
        filterQuery
      )
      .subscribe((data) => {
        this.leadDetails = data?.content;
        this.pageConfig.totalElements = data?.totalElements;
        this.pageConfig.totalPages = data?.totalPages;
        this.leadDetails.map((item) => {
          item.phoneNumber = item.phone?.number;
          item.addressLine = this.formatAddress(item.address);
          item.addressCity = item.address?.addressCity;
          item.addressZipCode = item.address?.addressZipCode;
          item.createdDate = item?.audit?.createdDate.split('T')[0];
          item.lastModifiedDate = item?.audit?.lastModifiedDate.split('T')[0];
          item.assignedSalesId = item.assignedSalesId
            ?.replace(/#/g, '')
            .split(',')
            .map(Number);
        });
      });
  }

  loadProspectDetails(filterQuery?: any) {
    filterQuery = filterQuery || '';
    if (this.productCategoryId) {
      filterQuery = `&filter=productCategoryIdList~'*%23${this.productCategoryId}%23*'`;
    }
    this.apiService
      .Get_All_Prospects(
        this.searchText,
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        this.employeeId,
        filterQuery
      )
      .subscribe((data) => {
        this.prospectDetails = data?.content;
        this.pageConfig.totalElements = data?.totalElements;
        this.pageConfig.totalPages = data?.totalPages;
        this.prospectDetails.map((item) => {
          item.phoneNumber = item.phone?.number;
          item.addressLine = this.formatAddress(item.address);
          item.addressCity = item.address?.addressCity;
          item.addressZipCode = item.address?.addressZipCode;

          item.showInwardArrow = item?.relationAcceptedStatus == 'PENDING';
          item.showOutwardArrow =
            item?.reverseRelationAcceptedStatus == 'PENDING';
          item.showResendInviteButton = this.checkInviteDate(
            item.inviteCreatedDate
          );
          item.showAcceptRelationButton =
            item?.relationAcceptedStatus == 'PENDING';
          item.showRejectRelationButton =
            item?.relationAcceptedStatus == 'PENDING';
          item.createdDate = item?.audit?.createdDate.split('T')[0];
          item.lastModifiedDate = item?.audit?.lastModifiedDate.split('T')[0];
          item.assignedSalesId = item.assignedSalesId
            ?.replace(/#/g, '')
            .split(',')
            .map(Number);
        });
      });
  }

  editRecord(event): void {
    if (event?.data?.id) {
      const url = this.isCustomer
        ? this.getCustomerEditUrl(event.data.id)
        : `${this.vendorEditBasePath}/edit/${event.data.id}`;
      this.router.navigateByUrl(url);
    }
  }

  getCustomerEditUrl(id: number): string {
    return `${this.customerEditBasePath}/edit/${id}`;
  }

  loadEmployees() {
    this.businessAccountService.employeesList.forEach((e) => {
      this.businessAccounts.push(e);
    });
    this.empName = this.businessAccounts.find((x) => x.id);
    if (this.empName) {
      this.customerDetails.map((x) =>
        x.salesRepId == this.empName.id
          ? (x.salesRepId = this.empName.firstName)
          : '-'
      );
    }
  }

  loadCustomerDetails(filterQuery?: any) {
    filterQuery = filterQuery || '';
    if (this.productCategoryId) {
      filterQuery = `&filter=productCategoryIdList~'*%23${this.productCategoryId}%23*'`;
    }
    this.apiService
      .Get_All_Customers(
        this.searchText,
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        this.employeeId,
        filterQuery
      )
      .subscribe((customer) => {
        this.customerDetails = customer.content;
        this.pageConfig.totalElements = customer?.totalElements;
        this.pageConfig.totalPages = customer?.totalPages;
        this.customerDetails.map((item) => {
          item.phoneNumber = item.phone?.number;
          item.addressLine = this.formatAddress(item.address);
          item.addressCity = item.address?.addressCity;
          item.addressZipCode = item.address?.addressZipCode;
          item.showResendInviteButton = this.checkInviteDate(
            item.inviteCreatedDate
          );
          item.showInwardArrow = item?.relationAcceptedStatus == 'PENDING';
          item.showOutwardArrow =
            item?.reverseRelationAcceptedStatus == 'PENDING';
          item.showAcceptRelationButton =
            item?.relationAcceptedStatus == 'PENDING';
          item.showRejectRelationButton =
            item?.relationAcceptedStatus == 'PENDING';
          item.createdDate = item?.audit?.createdDate.split('T')[0];
          item.lastModifiedDate = item?.audit?.lastModifiedDate.split('T')[0];
          item.assignedSalesId = item.assignedSalesId
            ?.replace(/#/g, '')
            .split(',')
            .map(Number);
        });

        this.loadEmployees();
      });
  }
  loadlcpDetails(filterQuery?: any) {
    filterQuery = filterQuery || '';
    if (this.productCategoryId) {
      filterQuery = `&filter=productCategoryIdList~'*%23${this.productCategoryId}%23*'`;
    }
    this.apiService
      .Get_All_Lcp(
        this.searchText,
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        this.employeeId,
        filterQuery
      )
      .subscribe((customer) => {
        this.lcpDetails = customer.content;
        this.pageConfig.totalElements = customer?.totalElements;
        this.pageConfig.totalPages = customer?.totalPages;
        this.lcpDetails.map((item) => {
          item.phoneNumber = item.phone?.number;
          item.addressLine = this.formatAddress(item.address);
          item.addressCity = item.address?.addressCity;
          item.addressZipCode = item.address?.addressZipCode;
          item.createdDate = item?.audit?.createdDate.split('T')[0];
          item.lastModifiedDate = item?.audit?.lastModifiedDate.split('T')[0];
          item.businessCategory = item?.businessCategory[0];
          item.assignedSalesId = item.assignedSalesId
          ?.replace(/#/g, '')
          .split(',')
          .map(Number);
        });
      });
  }
  onInput(searchText): void {
    this.searchText = searchText;
    this.loadListing();
  }

  changeMainTab(event: any) {
    this.pageConfig.totalElements = null;
    this.pageIndex = 0;
    this.pageS = 20;
    this.searchText = '';
    this.sortQuery = 'id,desc';
    if (this.router.url.includes('users-management')) {
      this.currentMainIndex = 2;
    } else {
      this.currentMainIndex = event;
    }
    this.loadListing();
  }

  get isCustomer() {
    return (
      window.location.href.includes('customer') ||
      window.location.href.includes('lead') ||
      window.location.href.includes('prospect')
    );
  }

  /** Base path for list/edit when under users-management or legacy customer/lead/prospect routes */
  get customerEditBasePath(): string {
    const url = this.router.url;
    if (url.includes('users-management')) {
      if (url.includes('/leads')) return '/home/users-management/leads';
      if (url.includes('/prospects')) return '/home/users-management/prospects';
      if (url.includes('/customers')) return '/home/users-management/customers';
      return '/home/users-management/customers';
    }
    if (this.currentMainIndex === 0 || this.currentMainIndex === 1) return '/home/customer';
    if (this.currentMainIndex === 2) return '/home/lead';
    if (this.currentMainIndex === 3) return '/home/prospect';
    return '/home/customer';
  }

  get vendorEditBasePath(): string {
    return this.router.url.includes('users-management') ? '/home/users-management/vendor' : '/home/vendor';
  }

  private get addUrlBase(): string {
    return this.router.url.includes('users-management') ? '/home/users-management' : '/home';
  }

  get customerAddUrl(): string {
    return this.addUrlBase + (this.router.url.includes('users-management') ? '/customers/add' : '/customer/add');
  }
  get leadAddUrl(): string {
    return this.addUrlBase + (this.router.url.includes('users-management') ? '/leads/add' : '/lead/add');
  }
  get prospectAddUrl(): string {
    return this.addUrlBase + (this.router.url.includes('users-management') ? '/prospects/add' : '/prospect/add');
  }
  get vendorAddUrl(): string {
    return this.addUrlBase + '/vendor/add';
  }

  get isLead() {
    return window.location.href.includes('lead');
  }

  get isProspect() {
    return window.location.href.includes('prospect');
  }

  sort(event) {
    if (!event.direction || event.direction == '' || event.direction == ' ') {
      this.sortQuery = 'id,desc';
    } else if (
      event.active == 'lastModifiedDate' ||
      event.active == 'createdDate'
    ) {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
    } else if (event.active == 'addressCity') {
      this.sortQuery = `address.addressCity,${event.direction}`;
    } else if (event.active == 'addressZipCode') {
      this.sortQuery = `address.addressZipCode,${event.direction}`;
    } else {
      this.sortQuery = event.active + ',' + event.direction;
    }
    this.loadListing();
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadListing();
  }

  navigateByLink(link: string) { 
    this.router.navigateByUrl(link);
  }





  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          if (this.isCustomer) {
            this.router.navigateByUrl(this.getCustomerEditUrl(event?.row?.id));
          } else {
            this.router.navigateByUrl(`${this.vendorEditBasePath}/edit/${event?.row?.id}`);
          }
        }
        break;

      case 'Send':
        break;
      case 'Quick Checkout':
        this.router.navigateByUrl(
          '/home/quick-checkout/order?vendorId=' + event?.row?.relationAccountId
        );
        break;
      case 'Quick Quotation':
        this.router.navigateByUrl(
          '/home/order-management/customer/quotation/add?customerId=' +
            event?.row?.relationAccountId
        );
        break;
      case 'Rec. PO':
        this.router.navigateByUrl(
          '/home/order-management/customer/receivedPo/add?customerId=' +
            event?.row?.relationAccountId
        );
        break;
      case 'Quotation':
        this.router.navigateByUrl(
          '/home/order-management/customer/quotation/add?customerId=' +
          event?.row?.relationAccountId
        );
        break;
      case 'Invoice':
        this.router.navigateByUrl(
          '/home/order-management/customer/invoice/add?customerId=' +
          event?.row?.relationAccountId
        );
        break;

      case 'Accept':
        this.updateRelationStatus('ACCEPTED', event?.row?.id);
        break;
      case 'Reject':
        this.updateRelationStatus('REJECTED', event?.row?.id);
        break;
      case 'Note':
        this.loadNotes(event?.row);
        break;
      case 'Reminder':
        this.loadReminders(event?.row);
        break;
      case 'Convert to Prospect':
        this.confirmChangeBusinessCategory('PROSPECT', event);

        break;
      case 'Convert to Customer':
        this.confirmChangeBusinessCategory('CUSTOMER', event);

        break;

      case 'Upload Note Image':
        this.uploadNoteImage(event?.row?.id);
        break;

      case 'Resend':
        break;
    }
  }

  uploadNoteImage(relationId: any) {
    let file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.multiple = true;
    file.click();
    file.onchange = (e: any) => {
      const files = e.target.files;
      if (file) {
        this.vendorCustomerService.saveNoteByImage(relationId, files).subscribe(
          (response) => {
            this.toastr.success('Image uploaded and note saved successfully');
            this.loadListing();
          },
          (error) => {
            this.toastr.error(
              error?.error?.userMessage ?? 'Failed to upload image'
            );
          }
        );
      }
    };
  }

  openNoteDialog(data: any) {
    this.dialog
      .open(NoteDialogComponent, {
        panelClass: 'note-dialog',
        width: '60%',
        data: {
          type: 'note',
          relationAccountDetail: data.row,
          assignedSalesId: data.row.assignedTo,
          notes: data.notes,
          businessCategory:  data.row.businessCategory,
          relationStatusId: data.row.relationStatusId,
          id: data.row.id,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.loadListing();
      });
  }

  openReminderDialog(data: any) {
    this.dialog
      .open(NoteDialogComponent, {
        panelClass: 'reminder-dialog',
        width: '60%',
        data: {
          type: 'reminder',
          reminders: data.reminders,
          id: data.row.id,
          relationAccountDetail: data.row,
          assignedSalesId: data.row.assignedTo,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.loadListing();
      });
  }

  async updateRelationStatus(status: any, id: any) {
    try {
      const data = await this.businessAccountService
        .updateRelationStatus(id, status)
        .toPromise();
      this.loadListing();
      this.toastr.success('Successfully Updated');
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async updateLeadField(id, fieldName, value, row) {
    try {
      let joinedString = value;
      if (fieldName == 'SALES_REP') {
        joinedString = value.join(',');
      }
      const data = await this.vendorCustomerService
        .updateLeadField(id, fieldName, joinedString)
        .toPromise();
      if (fieldName == 'RELATION_STATUS_ID') {
        this.loadNotes(row);
      }
      if (data.status == 'FAILED') {
        this.toastr.error(data?.errorMessage);
        return;
      }
      this.toastr.success(data?.message);
      this.loadListing();
    } catch (err: any) {
      this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
    }
  }

  async bulkUpdateLeadField(
    relationAccountIds,
    fieldName,
    values,
    clearAllnAdd
  ) {
    try {
      const data = await this.vendorCustomerService
        .bulkUpdateLeadField(
          relationAccountIds.join(','),
          fieldName,
          values,
          clearAllnAdd
        )
        .toPromise();
      if (data.status == 'FAILED') {
        this.toastr.error(data?.errorMessage);
        return;
      }
      this.toastr.success(data?.message);
      this.loadListing();
      this.salesRepIds = [];
      this.relationStatusId = null;
      this.dataTable().clearSelection();
      this.bulkAssignmentIds = [];
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
    }
  }

  loadNotes(row: any) {
    this.vendorCustomerService.Get_All_Notes(row?.id).subscribe((res) => {
      const notesArray = this.fb.array([]);
      res.forEach((element) => {
        const noteForm = this.vendorFormService.noteForm();
        noteForm.patchValue(element);
        notesArray.push(noteForm);
      });
      this.openNoteDialog({ notes: notesArray, row: row, relationAccountDetail: row, assignedSalesId: row.assignedTo });
    });
  }

  loadReminders(row: any) {
    this.vendorCustomerService.Get_All_Reminders(row?.id).subscribe((res) => {
      this.openReminderDialog({ reminders: res, row: row });
    });
  }

  onEdit(event) {
    if (event.field == 'relationStatusId') {
      this.updateLeadField(
        event.row.id,
        'RELATION_STATUS_ID',
        event.value,
        event.row
      );
    }
    if (event.field == 'assignedSalesId') {
      this.updateLeadField(event.row.id, 'SALES_REP', event.value, event.row);
    }
    if (event.field == 'upsTrackingNo') {
      this.updateLeadField(
        event.row.id,
        'TRACKING_NO',
        event.value.target.value,
        event.row
      );
    }
  }

  filterLeads(queryParams: any) {
    this.loadLeadDetails(queryParams);
  }
  filterUnassignedLeads() {
    if (!this.unassignedFilter) {
      this.unassignedFilter = true;
      let filterQuery = 'assignedSalesId IS NULL';
      this.loadLeadDetails(filterQuery);
    } else {
      this.loadLeadDetails();
      this.unassignedFilter = false;
    }
  }
  async generatePdfWithAddress(): Promise<void> {
    if (this.bulkAssignmentData.length === 0) {
      this.toastr.error('Please select at least one customer');
      return;
    }

    try {
      this.toastr.info('Generating merged PDF, please wait...');
      await this.pdfGeneratorService.generatePdf(this.bulkAssignmentData,true);
      this.toastr.success('Merged PDF downloaded successfully');
    } catch (error) {
      console.error(error);
      this.toastr.error('An error occurred during PDF generation');
    }
  }

  onRowSelection(event: any) {
    // Update selected IDs
    this.bulkAssignmentIds = event?.length > 0 ? event : [];

    // Helper: get data based on currentMainIndex
    const getDataByIds = (ids: any[]) => {
      const source =
        this.currentMainIndex == 1 ? this.customerDetails : this.leadDetails;

      return ids
        .map((id) => {
          const customer = source.find((c: any) => c.id === id);
          if (customer) {
            const address = this.formatAddress(customer.address);
            return {
              ...customer,
              addressLine: address,
            };
          }
          return null;
        })
        .filter((c) => c !== null);
    };

    // Build a map of selected IDs for quick lookup
    const selectedIdSet = new Set(this.bulkAssignmentIds);

    // Filter out entries that are no longer selected
    this.bulkAssignmentData = this.bulkAssignmentData.filter((entry: any) =>
      selectedIdSet.has(entry.id)
    );

    // Get new entries from the selection that are not already in the list
    const existingIds = new Set(this.bulkAssignmentData.map((d: any) => d.id));
    const newEntries = getDataByIds(this.bulkAssignmentIds).filter(
      (entry: any) => !existingIds.has(entry.id)
    );

    // Append new entries
    this.bulkAssignmentData = [...this.bulkAssignmentData, ...newEntries];
  }

  assignLeads() {
    if (this.bulkAssignmentIds.length == 0) {
      this.toastr.error('Please select atleast one lead');
      return;
    }
    this.bulkUpdateLeadField(
      this.bulkAssignmentIds,
      'SALES_REP',
      this.salesRepIds.join(','),
      false
    );
  }

  unassignLeads() {
    if (this.bulkAssignmentIds.length == 0) {
      this.toastr.error('Please select atleast one lead');
      return;
    }
    this.bulkUpdateLeadField(
      this.bulkAssignmentIds,
      'SALES_REP_UNASSIGN',
      this.salesRepIds.join(','),
      true
    );
  }

  assignRelationStatus() {
    this.bulkUpdateLeadField(
      this.bulkAssignmentIds,
      'RELATION_STATUS_ID',
      this.relationStatusId,
      true
    );
  }

  openLeadsBulkAddDialog() {
    this.dialog
      .open(BulkAddDialogComponent, {
        width: '90%',
        maxWidth: '900px',
        panelClass: 'leads-bulk-add-dialog-panel',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.success) {
          this.loadListing();
        }
      });
  }

  async bulkUploadLeadExcel(file: any) {
    try {
      this.dialog
        .open(selectSalesRepDialogComponent, {
          width: '60%',
          id: 'selectSalesRepDialog',
        })
        .afterClosed()
        .subscribe(async (salesRepId) => {
          const formData = new FormData();
          formData.append('file', file);
          if (salesRepId) {
            formData.append('salesRepId', salesRepId);
          }
          const data = await this.vendorCustomerService
            .bulkUploadLeads(formData)
            .toPromise();
          if (data.status == 'FAILED') {
            this.toastr.error(data?.errorMessage);
            return;
          }
          this.toastr.success(data?.message);
        });
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async downloadSampleFile() {
    try {
      const data = await this.vendorCustomerService
        .downloadSampleFile()
        .toPromise();

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.toastr.success('Successfully Downloaded');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  confirmChangeBusinessCategory(businessCategory, event) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.updateLeadField(
            event.row.id,
            'BUSINESS_CATEGORY',
            businessCategory,
            event.row
          );
        }
      });
  }

  async generatePdfWithAddressFromJson(): Promise<void> {
    try {
      this.toastr.info('Generating merged PDF, please wait...');
      const response = await fetch('assets/brooklyn_pharmacy.json');
      // const response = await fetch('assets/brooklyn_pharmacy.json');
      if (!response.ok) {
        throw new Error('Failed to fetch JSON data');
      }
      let customers = await response.json();
      customers = customers.slice(800,930);
      const fileName='brooklyn-customers(800-912).pdf'
      await this.pdfGeneratorService.generatePdf(customers, false,fileName);
      this.toastr.success('Merged PDF downloaded successfully');
    } catch (error) {
      console.log(error);
      this.toastr.error('An error occurred during PDF generation');
    }
  }

  async openBusinessEntityConfiguration(): Promise<void> {
    // Determine configuration type based on current tab
    let configurationType: string = '';
    
    if (this.isCustomer) {
      switch (this.currentMainIndex) {
        case 0:
          configurationType = 'LCP';
          break;
        case 1:
          configurationType = 'CUSTOMER';
          break;
        case 2:
          configurationType = 'LEAD';
          break;
        case 3:
          configurationType = 'PROSPECT';
          break;
        default:
          configurationType = 'CUSTOMER';
      }
    } else {
      configurationType = 'VENDOR';
    }

    const dialogRef = this.dialog.open(BusinessEntityConfigurationComponent, {
      width: '90%',
      maxWidth: '1400px',
      height: '90vh',
      panelClass: 'business-entity-config-dialog',
      disableClose: false,
      data: {
        configurationType: configurationType
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Handle any result if needed after dialog closes
      if (result) {
        // Reload data or perform any action if needed
      }
    });
  }
}
