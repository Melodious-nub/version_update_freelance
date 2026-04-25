import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { ProductManagementService } from '../../service/product-management.service';
import { UomService } from 'src/app/service/uom.service';
import { FormsService } from 'src/app/service/forms.service';
import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { DataTableComponent } from '../../../../../shared/component/data-table/data-table.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../shared/component/search-filter/search-filter.component';
import { MatBadge } from '@angular/material/badge';

import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-product-tags-list',
    templateUrl: './product-tags-list.component.html',
    styleUrls: ['./product-tags-list.component.scss'],
    imports: [
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatBadge,
        MatTabContent,
        SearchFilterComponent,
        DadyinButtonComponent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent
    ]
})
export class ProductTagsListComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }
  uomSetting = false
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  public productsList: any[];
  public calculatorDetailsList: any[] = [];
  public processDetailsList: any[] = [];
  public productEditLink: any = "/home/product-management/product/edit/";
  productSubtypeEditLink: any = "/home/product-management/product-type/subtype/edit/";
  productTypeEditLink: any = '/home/product-management/product-type/edit/';
  productTemplateEditLink: any = '/home/product-management/product-template/edit/';
  public headers = [
    // { name: 'ID#', prop: 'id', sortable: true },
    { name: 'PRODUCT CODE', prop: 'productCode', sortable: true },
    { name: 'PRODUCT DETAILS', prop: 'description', sortable: true },
    { name: 'PRODUCT TYPE', prop: 'productTypeDescription', sortable: true, isLink: true, link: this.productTypeEditLink, idKey: 'productTypeId' },
    {
      name: 'SUBTYPE',
      prop: 'productSubTypeDescription',
      sortable: true,
      isLink: true,
      link: this.productSubtypeEditLink,
      idKey: 'productSubTypeId'
    },
    { name: 'TEMPLATE', prop: 'productTemplateName', sortable: true, isLink: true, link: this.productTemplateEditLink, idKey: 'productTemplateId' },
    { name: '#QOH', prop: 'qoh', sortable: true, dataType: 'number' },
    { name: 'METRIC COST', prop: 'metricCost', type: 'uom', dataType: 'number', hideNumberFormatter: true, isCurrency: true },
    { name: 'SKU COST', prop: 'skuCost', type: 'uom', dataType: 'number', isCurrency: true },
    { name: 'SKU PRICE', prop: 'skuMetricCost', type: 'uom', dataType: 'number', isCurrency: true },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true },
    { name: 'AUDIT', prop: 'lastModifiedByName', type: 'audit' },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];
  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
    {
      label: 'Copy',
      icon: 'content_copy',
    },
  ];
  public pageConfig = null;

  public activeTab = 'product-details';

  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'id,desc';

  currentMainIndex: number = 0;
  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Product Details',
      badge: 0,
      index: 0,
    },
  ];

  constructor(
    public router: Router,
    public apiService: ApiService,
    public http: HttpClient,
    public service: ProductManagementService,
    public uomService: UomService,
    public formsService: FormsService,
    public toastr: ToastrService,
    public businessAccountService:BusinessAccountService
  ) { }

  ngOnInit(): void {
    this.getPreference();
    this.pageConfig = {
      itemPerPage: 20,
      sizeOption: [20, 50, 75, 100],
    };
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      const preferenceForContainer = preference.find(
        (item) => item.componentType == 'PRODUCT'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);

      this.loadProductsTagsList()

    });
  }



  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  loadProductsTagsList(searchString: any = ''): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach(col => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value
          }`;
      });

    });
    uomQuery = encodeURI(uomQuery);
    this.apiService
      .Get_Product_List_By_Search(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        searchString
      )
      .subscribe((products: any) => {
        this.pageConfig.totalElements = products?.totalElements
        this.pageConfig.totalPages = products?.totalPages
        this.productsList = products?.content;
        const loggedInAccountId = this.businessAccountService.currentBusinessAccountId?.toString()
        this.productsList.map((x) => {
          x.createdBy = x.audit.businessAccountId == loggedInAccountId ? ('S') : (x.audit.businessAccountId == 1 ? 'M' : 'T')
        }
        );

      });
  }


  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/product-management/product/edit/' + event.row.id
          );
        }
        break;
      case 'Copy':

        break;
      case 'Download':
        break;
    }
  }


  addProduct(): void {
    this.router.navigateByUrl('/home/product-management/product/add');
  }

  onInput(filterValue: string): void {
    this.loadProductsTagsList(filterValue)

  }



  editRecord(event): void {
    if (event?.data?.id) {
      this.router.navigateByUrl(
        'home/product-management/product/edit/' + event.data.id
      );
    }
  }

  sort(event) {
    if (event.active == 'lastModifiedDate') {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
      this.loadProductsTagsList();
    } else {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadProductsTagsList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadProductsTagsList();
  }

  changeMainTab(event: any) {
    this.currentMainIndex = event;
    // this.navigateToUrl();
  }


  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }



}
