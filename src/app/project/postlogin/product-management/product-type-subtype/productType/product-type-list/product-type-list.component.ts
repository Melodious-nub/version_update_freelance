import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductManagementService } from '../../../service/product-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { SubtypeListComponent } from '../../subType/subtype-list/subtype-list.component';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';
import { MatBadge } from '@angular/material/badge';
import { NgFor, NgIf } from '@angular/common';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-product-type-list',
    templateUrl: './product-type-list.component.html',
    styleUrls: ['./product-type-list.component.scss'],
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
        SubtypeListComponent,
    ],
})
export class ProductTypeListComponent implements OnInit {
  public ProductTypeList: any;
  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'id,desc';
  productTypeEditLink: any = '/home/product-management/product-type/edit/';
  productTemplateEditLink: any =
    '/home/product-management/product-template/edit/';

  public headers = [
    { name: 'PRODUCT TYPE', prop: 'description', sortable: true },
    {
      name: 'PRODUCT TEMPLATE',
      prop: 'productTemplateName',
      sortable: true,
      isLink: true,
      link: this.productTemplateEditLink,
      idKey: 'productTemplateId',
    },
    {
      name: '#PRODUCT SUBTYPE',
      prop: 'productSubTypeCount',
      sortable: true,
      dataType: 'number',
      decimal: false,
      isLink: true,
      link: '/home/product-management/product-type?currentIndex=1&productTypeId=',
      idKey: 'id',
    },
    {
      name: '#PRODUCTS',
      prop: 'productCount',
      sortable: true,
      dataType: 'number',
      decimal: false,
      isLink: true,
      link: '/home/product-management/product?productTypeId=',
      idKey: 'id',
    },
    {
      name: '#DIVISION%',
      prop: 'divisionPercent',
      dataType: 'number',
      sortable: true,
      isPercent: true,
    },
    {
      name: '#EXPENSE%',
      prop: 'expensePercent',
      sortable: true,
      dataType: 'number',
      isPercent: true,
    },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];

  currentMainIndex: number = 0;
  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Product Type Details',
      badge: 0,
      index: 0,
    },
    {
      id: 2,
      title: 'Product Sub Type Details',
      badge: 0,
      index: 0,
    },
  ];
  constructor(
    private router: Router,
    private service: ProductManagementService,
    public route: ActivatedRoute,
    public businessAccountService: BusinessAccountService
  ) {
    this.route.queryParams.subscribe((res) => {
      this.currentMainIndex = res?.currentIndex ?? 0;
    });
  }

  ngOnInit(): void {
    this.loadProductTypeList();
  }

  loadProductTypeList(): void {
    this.service
      .getProductTypeBySearch(this.pageIndex, this.pageS, this.sortQuery)
      .subscribe((data: any) => {
        this.ProductTypeList = data.content;
        const loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId;
        this.ProductTypeList.map((x) => {
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

  onInput(filterValue: string): void {
    this.service
      .getProductTypeBySearch(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        filterValue
      )
      .subscribe((data: any) => {
        this.ProductTypeList = data.content;
        const loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId;
        this.ProductTypeList.map((x) => {
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
          'home/product-management/product-type/add' + event.row.id
        );
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  editRecord(event) {
    this.router.navigateByUrl(
      'home/product-management/product-type/edit/' + event.data.id
    );
  }

  onAddNewClick() {
    this.router.navigateByUrl('home/product-management/product-type/add');
  }

  sort(event) {
    if (event.active == 'lastModifiedDate') {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
      this.loadProductTypeList();
    } else {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadProductTypeList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadProductTypeList();
  }

  changeMainTab(event: any) {
    this.currentMainIndex = event;
    // this.navigateToUrl();
  }

  resetQueryParams() {
    this.router.navigateByUrl('home/product-management/product-type');
  }

  navigateToAddType() {
    this.router.navigateByUrl('home/product-management/product-type/add');
  }
}
