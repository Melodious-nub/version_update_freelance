import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { CategoryManagementService } from '../../service/category-management.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit {
  productCategories: any[] = [];
  filterValue;
  public headers = [
    {
      name: 'CUSTOMER CATEGORY',
      prop: 'description',
      sortable: true,
      minWidth: '100px',
      maxWidth: '250px',
    },
    {
      name: '#LEADS',
      prop: 'leads',
      sortable: true,
      dataType: 'number',
      decimal: false,
      isLink: true,
      link: '/home/lead/list?currentStepIndex=2&productCategoryId=',
      idKey: 'id',
      minWidth: '100px',
      maxWidth: '150px',
    },
    {
      name: '#PROSPECTS',
      prop: 'prospects',
      sortable: true,
      dataType: 'number',
      decimal: false,
      isLink: true,
      link: '/home/prospect/list?currentStepIndex=3&productCategoryId=',
      idKey: 'id',
      minWidth: '100px',
      maxWidth: '150px',
    },
    {
      name: '#CUSTOMERS',
      prop: 'customers',
      sortable: true,
      dataType: 'number',
      decimal: false,
      isLink: true,
      link: '/home/customer/list?currentStepIndex=1&productCategoryId=',
      idKey: 'id',
      minWidth: '100px',
      maxWidth: '150px',
    },
    {
      name: 'BUYING CAPACITY',
      prop: 'buyingCapacityType',
      dataType: 'number',
      decimal: false,
      sortable: true,
    },
    {
      name: '#PRODUCT TYPES',
      prop: 'productTypes',
      dataType: 'number',
      decimal: false,
      sortable: true,
    },
    {
      name: '#PRODUCT SUB TYPES',
      prop: 'productSubTypes',
      dataType: 'number',
      decimal: false,
      sortable: true,
    },
    {
      name: '#PRODUCTS',
      dataType: 'number',
      decimal: false,
      prop: 'productCount',
      sortable: true,
    },

    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];

  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
    { label: 'Quick Quotation', icon: 'request_quote' },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'audit.lastModifiedDate,desc';

  @Input() role: any;

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public apiService: ApiService,
    public http: HttpClient,
    public categoryManagementService: CategoryManagementService
  ) {}

  ngOnInit() {
    this.loadAllCategories();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/system-config/category-management/product-categories/edit/' +
              event.row.id
          );
        }
        break;

      case 'Copy':
        break;

      case 'Download':
        break;

      case 'Quick Quotation':
        this.router.navigateByUrl(
          '/home/order-management/customer/quotation/add?productCategoryId=' +
            event?.row?.id
        );
        break;
    }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
  }

  editRecord(event): void {
    this.router.navigateByUrl(
      'home/system-config/category-management/product-categories/edit/' +
        event.data.id
    );
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
  }

  addCategory() {
    this.router.navigateByUrl(
      '/home/system-config/category-management/product-categories/add'
    );
  }

  loadAllCategories() {
    this.categoryManagementService
      .getAllproductcategories(this.pageIndex, this.pageS, this.sortQuery)
      .subscribe((res) => {
        this.productCategories = res;
        this.pageConfig.totalElements = res?.totalElements;
        this.pageConfig.totalPages = res?.totalPages;
      });
  }
}
