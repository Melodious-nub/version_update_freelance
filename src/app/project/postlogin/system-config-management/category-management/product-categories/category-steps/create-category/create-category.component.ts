import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryManagementService } from '../../../service/category-management.service';
import { CategoryManagementFormsService } from '../../../service/category-management-forms.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { DataTableComponent } from '../../../../../../../shared/component/data-table/data-table.component';
import { DadyinSearchSelectNewComponent } from '../../../../../../../shared/widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { DadyinSearchableSelectComponent } from '../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-create-category',
    templateUrl: './create-category.component.html',
    styleUrls: ['./create-category.component.scss'],
    imports: [
        DadyinButtonComponent,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        DadyinSearchableSelectComponent,
        DadyinSearchSelectNewComponent,
        DataTableComponent,
    ]
})
export class CreateCategoryComponent implements OnInit {
  public pageConfig = null;
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'productCode';
  public productsList: any[];

  listViewAttribute = null;
  highlightProductTypeIds = [];
  highlightProductSubTypeIds = [];
  @Input() productCategoryForm: UntypedFormGroup;
  filteredSubTypes = [];
  public buyingCapacitiesList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];
  selectedProductType = null;
  public tabelActions: any = [];
  constructor(
    public toastr: ToastrService,
    public categoryManagementFormService: CategoryManagementFormsService,
    public categoryManagementService: CategoryManagementService,
    public fb: UntypedFormBuilder,
    public apiService: ApiService,
    public route: ActivatedRoute,
    public router: Router,
    public businessAccountService: BusinessAccountService
  ) {}

  ngOnInit(): void {
    this.apiService.Get_Industry_Types();
    this.apiService.Get_Product_Types();
    this.apiService.Get_Product_Sub_Types();
    this.apiService.Get_Customer_Categories();
    const id = this.route.snapshot.params.id;
    this.pageConfig = {
      itemPerPage: 20,
      sizeOption: [20, 50, 75, 100],
    };
    if (id) {
      this.getDetailById(id);
    } else {
      this.loadProductsList();
    }
    this.categoryProductTypes.valueChanges.subscribe((categoryProductTypes) => {
      this.setSubTypes(true);
    });
  }

  setSubTypes(removed) {
    setTimeout(() => {
      this.filteredSubTypes = this.apiService.productSubTypes.filter((it) =>
        this.categoryProductTypes?.value?.includes(it.productTypeId)
      );
      const filteredSubTypeIds = this.filteredSubTypes.map((it) => it.id);
      if (removed) {
        let subTypeIds = this.productSubTypeIds.value;
        subTypeIds = subTypeIds?.filter((it) =>
          filteredSubTypeIds.includes(it)
        );
        this.productSubTypeIds.patchValue(subTypeIds);
      }
    }, 500);
  }

  // get filteredSubTypes() {
  //   return this.filteredSubTypes?.map((subType) => ({
  //     ...subType,
  //     description: `${subType?.description} ( ${subType?.productTypeDescription} )`,
  //   }));
  // }

  getDetailById(id: any) {
    this.categoryManagementService
      .getCategoryDetailById(id)
      .subscribe((res) => {
        const productTypeIds = res.categoryProductTypes.map(
          (it) => it.productTypeId
        );

        const formData = {
          id: res?.id,
          productSubTypeIds: res?.productSubTypeIds,
          description: res?.description,
          categoryIndustryTypes: res?.categoryIndustryTypes,
          buyingCapacityType: res?.buyingCapacityType,
        };
        this.productCategoryForm.patchValue(formData);
        const productSubTypeIds = [];
        res.categoryProductTypes.forEach((producttype) => {
          producttype.productSubTypeIds.forEach((subtypeid) => {
            productSubTypeIds.push(subtypeid);
          });
        });
        this.productSubTypeIds.patchValue(productSubTypeIds);
        this.categoryProductTypes.patchValue(productTypeIds, {
          emitEvent: false,
          onlySelf: true,
        });
        this.setSubTypes(false);
        this.loadProductsList();
      });
  }

  saveCategory() {
    let data: any = JSON.parse(
      JSON.stringify(this.productCategoryForm.getRawValue())
    );
    const categoryProductTypes = [];
    const productSubTypeIds = this.productSubTypeIds.value;

    data.categoryProductTypes.forEach((el) => {
      const customProductSubTypeIds = [];
      productSubTypeIds.forEach((subtypeid) => {
        const productSubType = this.filteredSubTypes.find(
          (subtype) => subtype.id == subtypeid
        );
        if (productSubType && productSubType?.productTypeId == el) {
          customProductSubTypeIds.push(subtypeid);
        }
      });
      const element = {
        id: null,
        productTypeDescription: '',
        productSubTypeDescriptions: [],
        productTypeId: el,
        productSubTypeIds: customProductSubTypeIds,
      };
      categoryProductTypes.push(element);
    });
    data.categoryProductTypes = categoryProductTypes;
    delete data.productSubTypeIds;
    this.categoryManagementService.saveProductCategory(data).subscribe(
      (res) => {
        this.toastr.success('Saved Succesfully');
        this.apiService.Get_Customer_Categories();
        this.router.navigateByUrl('/home/system-config/category-management');
      },
      (err) => {
        this.toastr.error('Error occurred', err?.error?.message);
      }
    );
  }

  navigate(link: any) {
    this.router.navigateByUrl(link);
  }

  get categoryProductTypes() {
    return this.productCategoryForm.get('categoryProductTypes');
  }
  get productSubTypeIds() {
    return this.productCategoryForm.get('productSubTypeIds');
  }

  get categoryIndustryTypes() {
    return this.productCategoryForm.get('categoryIndustryTypes');
  }
  get id() {
    return this.productCategoryForm.get('id');
  }
  get buyingCapacityType() {
    return this.productCategoryForm.get('buyingCapacityType');
  }

  onClickProductType(productTypeId) {
    const index = this.highlightProductTypeIds.indexOf(productTypeId);
    if (index === -1) {
      this.highlightProductTypeIds.push(productTypeId);
      const filteredSubTypes = this.apiService.productSubTypes.filter(
        (it) => productTypeId == it.productTypeId
      );
      const filteredSubTypeIds = filteredSubTypes.map((it) => it.id);
      filteredSubTypeIds.forEach((itm) => {
        if (!this.highlightProductSubTypeIds.includes(itm)) {
          this.highlightProductSubTypeIds.push(itm);
        }
      });
    } else {
      this.highlightProductTypeIds.splice(index, 1);
      const filteredSubTypeIds = this.apiService.productSubTypes
        .filter((it) => productTypeId == it.productTypeId)
        .map((it) => it.id);
      filteredSubTypeIds.forEach((itm) => {
        const index = this.highlightProductSubTypeIds.indexOf(itm);
        if (index !== -1) {
          this.highlightProductSubTypeIds.splice(index, 1);
        }
      });
    }
  }

  // related to product list
  public headers = [
    // { name: 'AUDIT', prop: 'lastModifiedByName', type: 'audit' },
    { name: 'PRODUCT CODE', prop: 'productCode', sortable: true },
    { name: 'PRODUCT DETAILS', prop: 'description', sortable: true },
    {
      name: 'PRODUCT TYPE',
      prop: 'productTypeDescription',
      sortable: true,

      idKey: 'productTypeId',
    },
    {
      name: 'SUBTYPE',
      prop: 'productSubTypeDescription',
      sortable: true,

      idKey: 'productSubTypeId',
    },
    {
      name: 'TEMPLATE',
      prop: 'productTemplateCode',
      sortable: true,

      idKey: 'productTemplateId',
    },
    { name: '#QOH', prop: 'qoh', sortable: true, dataType: 'number' },
    {
      name: 'METRIC COST',
      prop: 'metricCost',
      type: 'uom',
      dataType: 'number',
      hideNumberFormatter: true,
      isCurrency: true,
    },
    {
      name: 'SKU COST',
      prop: 'skuCost',
      type: 'uom',
      dataType: 'number',
      isCurrency: true,
    },
    {
      name: 'SKU PRICE',
      prop: 'skuPrice',
      type: 'uom',
      dataType: 'number',
      isCurrency: true,
    },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true },

    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];

  loadProductsList(filter: any = ''): void {
    const formData = this.productCategoryForm.getRawValue();
    filter = filter + "&filter=status!'DELETED'";
    let uomQuery = '';
    if (formData?.categoryProductTypes?.length > 0) {
      filter =
        filter +
        '&filter=productTypeId in (' +
        formData?.categoryProductTypes?.join(',') +
        ')';
    }
    if (formData?.productSubTypeIds?.length > 0) {
      filter =
        filter +
        '&filter=productSubTypeId in (' +
        formData?.productSubTypeIds?.join(',') +
        ')';
    }


    this.apiService
      .Get_Product_List_By_Search(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        '',
        filter
      )
      .subscribe((products: any) => {
        this.pageConfig.totalElements = products?.totalElements;
        this.pageConfig.totalPages = products?.totalPages;
        this.productsList = products?.content;
        const loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId;
        this.productsList.forEach((x) => {
          x.createdBy =
            x.audit.businessAccountId == loggedInAccountId && x.isSelfProduct
              ? 'S'
              : x.audit.businessAccountId == 1
              ? 'M'
              : 'T';
        });
        this.productsList.forEach((x) => {
          if (x.preferredCustomerId) {
            x.isMyProduct = true;
          }
        });
      });
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        break;
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadProductsList();
  }

  sort(event) {
    if (event.active == 'lastModifiedDate') {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
      this.loadProductsList();
    } else {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadProductsList();
    }
  }

  onProductTypeChange($event) {
    this.loadProductsList();
  }
  onProductSubTypeChange($event) {
    this.loadProductsList();
  }
}
