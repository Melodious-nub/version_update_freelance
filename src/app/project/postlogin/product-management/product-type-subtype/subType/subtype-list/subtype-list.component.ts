import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LOCALSTORAGEKEYS } from 'src/app/shared/constant';
import { ProductManagementService } from '../../../service/product-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-subtype-list',
    templateUrl: './subtype-list.component.html',
    styleUrls: ['./subtype-list.component.scss'],
    standalone: true,
    imports: [
        SearchFilterComponent,
        DadyinButtonComponent,
        DataTableComponent,
    ],
})
export class SubtypeListComponent implements OnInit {
  public filterValue: string;
  public SubTypeDetailsList: any;
  public SubTypeDetails: any;
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
  public productSubtypeEditLink: any =
    '/home/product-management/product-type/subtype/edit/';
  productTypeEditLink: any = '/home/product-management/product-type/edit/';
  productTemplateEditLink: any =
    '/home/product-management/product-template/edit/';
  public headers = [
    { name: 'PRODUCT SUBTYPE', prop: 'description' },
    {
      name: 'PRODUCT TYPE ',
      prop: 'productTypeDescription',
      isLink: true,
      link: this.productTypeEditLink,
      idKey: 'productTypeId',
    },
    {
      name: 'PRODUCT TEMPLATE',
      prop: 'templateDescription',
      isLink: true,
      link: this.productTemplateEditLink,
      idKey: 'productTemplateId',
    },

    {
      name: '#PRODUCTS',
      prop: 'productCount',
      sortable: true,
      dataType: 'number',
      decimal: false,
      isLink: true,
      link: '/home/product-management/product?productSubTypeId=',
      idKey: 'id',
    },
    {
      name: '#DIVISION%',
      prop: 'divisionPercent',
      dataType: 'number',
      isPercent: true,
    },
    {
      name: '#EXPENSE%',
      prop: 'expensePercent',
      dataType: 'number',
      isPercent: true,
    },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'id,desc';
  productTypeId = null;
  constructor(
    private router: Router,
    private service: ProductManagementService,
    public route: ActivatedRoute,
    public businessAccountService: BusinessAccountService
  ) {}

  ngOnInit(): void {
    this.productTypeId =
      this.route.snapshot.queryParams['productTypeId'] ?? null;
    this.loadProductSubTypeList();
  }

  onInput(filterValue: string): void {
    this.service
      .getProductSubTypeBySearch(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        this.productTypeId,
        filterValue
      )
      .subscribe((data: any) => {
        this.SubTypeDetailsList = data.content;
        const loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId?.toString();
        this.SubTypeDetailsList.map((x) => {
          x.createdBy =
            x.audit.businessAccountId == loggedInAccountId
              ? 'S'
              : x.audit.businessAccountId == 1
              ? 'M'
              : 'T';
        });
        this.pageConfig.totalPages = data?.totalPages;
        this.pageConfig.totalElements = data?.totalElements;
      });
  }

  loadProductSubTypeList(): void {
    this.service
      .getProductSubTypeBySearch(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        this.productTypeId
      )
      .subscribe((data: any) => {
        this.SubTypeDetailsList = data.content;
        const loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId?.toString();
        this.SubTypeDetailsList.map((x) => {
          x.createdBy =
            x.audit.businessAccountId == loggedInAccountId
              ? 'S'
              : x.audit.businessAccountId == 1
              ? 'M'
              : 'T';
        });
        this.pageConfig.totalPages = data?.totalPages;
        this.pageConfig.totalElements = data?.totalElements;
      });
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.router.navigateByUrl(
          'home/product-management/product-type/subtype/edit/' + event.row.id
        );
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadProductSubTypeList();
  }

  onAddNewClick() {
    this.router.navigateByUrl(
      'home/product-management/product-type/subtype/add'
    );
  }

  editRecord(event) {
    this.router.navigateByUrl(
      'home/product-management/product-type/subtype/edit/' + event.data.id
    );
  }

  sort(event) {
    if (event.active == 'lastModifiedDate') {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
      this.loadProductSubTypeList();
    } else {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadProductSubTypeList();
    }
  }
  navigateToAddSubType() {
    this.router.navigateByUrl('home/product-management/product-type/subtype/add');
  }
}
