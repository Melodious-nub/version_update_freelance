import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProdTemplate } from 'src/app/model/common/product-template.model';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';

@Component({
  selector: 'app-product-template-list',
  templateUrl: './product-template-list.component.html',
  styleUrls: ['./product-template-list.component.scss'],
})
export class ProductTemplateListComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }
  uomSetting = false
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  public productTemplateList: any[];
  public calculatorDetailsList: any[] = [];
  public processDetailsList: any[] = [];
  public filterValue: string;
  public editLink: any = "/home/product-management/product-template/edit/";
  public headers = [
    { name: 'AUDIT', prop: 'lastModifiedByName', type: 'audit' },
    { name: 'TEMPLATE CODE', prop: 'templateCode', sortable: true },
    { name: '#TYPE', prop: 'productTypeCount', dataType: 'number', decimal: false },
    { name: '#SUB TYPE', prop: 'productSubTypeCount', dataType: 'number', decimal: false, isLink: true, link: '/home/product-management/product-type?currentIndex=1&product', sortable: true },
    { name: 'CALCULATOR', prop: 'calculatorDescription', sortable: true },
    { name: '#PROCESS', prop: 'processCount', sortable: true, dataType: 'number', decimal: false },
    { name: '#MATERIALS', prop: 'materialCount', sortable: true, dataType: 'number', decimal: false },
    { name: '#PKG', prop: 'packageCount', sortable: true, dataType: 'number', decimal: false },
    { name: 'FINAL PRODUCT', prop: 'last_process_product_description', sortable: true },
    { name: 'TOTAL COST', prop: 'metricCost', sortable: true, type: 'uom', dataType: 'number' },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true },
    { name: 'ACTIONS', prop: 'action', type: 'menu' }
  ];
  public tabelActions: any = [{
    label: 'Edit',
    icon: 'edit'
  }];
  public pageConfig = null;

  public activeTab = 'product-template';

  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'id,desc';

  currentMainIndex: number = 0;

  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Template Details',
      badge: 0,
      index: 0
    }
  ];

  constructor(
    private router: Router,
    public apiService: ApiService,
    public http: HttpClient,
    public formsService: FormsService,
    public uomService: UomService,
    public businessAccountService: BusinessAccountService
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
        (item) => item.componentType == 'PRODUCT_TEMPLATE'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);
      this.loadProductTempList();
    });
  }




  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }


  loadProductTempList(): void {
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
      .Get_Product_Template_By_Search(this.pageIndex, this.pageS, this.sortQuery, "", uomQuery)
      .subscribe((prodTemplate) => {
        this.pageConfig.totalElements = prodTemplate?.totalElements
        this.pageConfig.totalPages = prodTemplate?.totalPages
        this.productTemplateList = prodTemplate.content;
        const loggedInAccountId = this.businessAccountService.currentBusinessAccountId?.toString()
        this.productTemplateList.map((x) => {
          x.createdBy = x.audit.businessAccountId == loggedInAccountId ? ('S') : (x.audit.businessAccountId == 1 ? 'M' : 'T')
        })
      });
  }
  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl('home/product-management/product-template/edit/' + event.row.id);
        }
        break;

      case 'Copy':
        ;
        break;

      case 'Download':
        ;
        break;
    }
  }
  addProductTemplate(): void {
    this.router.navigateByUrl('/home/product-management/product-template/create');
  }

  onInput(filterValue: string): void {
    this.apiService
      .Get_Product_Template_By_Search(this.pageIndex, this.pageS, this.sortQuery, filterValue)
      .subscribe((prodTemplate) => {
        this.productTemplateList = prodTemplate.content;
        const loggedInAccountId = this.businessAccountService.currentBusinessAccountId?.toString()
        this.productTemplateList.map((x) => {
          x.createdBy = x.audit.businessAccountId == loggedInAccountId ? ('S') : (x.audit.businessAccountId == 1 ? 'M' : 'T')
        })
        this.pageConfig.totalElements = prodTemplate?.totalElements
        this.pageConfig.totalPages = prodTemplate?.totalPages
      });
  }

  editRecord(event): void {
    if (event?.data?.id) {
      this.router.navigateByUrl('home/product-management/product-template/edit/' + event.data.id);
    }
  }

  sort(event) {
    ;
    if (event.active == 'lastModifiedDate') {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
      this.loadProductTempList();
    } else {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadProductTempList();
    }
  }

  pageChange(event) {
    ;
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadProductTempList();
  }


  changeMainTab(event: any) {
    this.currentMainIndex = event;
    // this.navigateToUrl();
  }
}
