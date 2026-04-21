import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { HttpService } from './http.service';
import {
  apiModules,
  customer,
  invoiceConfigModule,
  orderConfigModule,
  productTemplate,
  productType,
  relationAccountApis
} from '../shared/constant';
import { TokenService } from './token.service';
@Injectable({ providedIn: 'root' })
export class ApiService {
  productSubTypes: any[] = [];
  allproductsListForProcess: any[] = [];
  allproductsWithIsPackage: any[] = [];
  conversionTypes: any[] = [];
  allAttributes: any[] = [];
  allAttributesTypes: any[] = [];
  productTypes: any[] = [];
  packageTypes: any[] = [];
  allIndustryTypes: any[] = [];
  productCategoriesList: any[] = [];
  hsnIndiaList: any[] = [];
  hsnUSAList: any[] = [];
  finalSave = true;
  processList: any[] = [];
  allCalculatorMetas: any[] = [];
  isEditable = false;
  calculatorMetaDetails: any;
  calculatorMetaLoaded = new UntypedFormControl(false);

  productTemplateForCalculation: any = new UntypedFormControl(null);
  productTypeForCalculation: any = new UntypedFormControl(null);

  syncTemplate = new UntypedFormControl(false);
  googleMapApiLoaded = false;
  skuTypes: any[] = [
    { id: 'UNIT', description: 'UNIT' },
    { id: 'BOX', description: 'BOX' },
    { id: 'BUNDLE', description: 'BUNDLE' },
    { id: 'PALLET', description: 'PALLET' },
    { id: 'BALE', description: 'BALE' },
  ];

  allRelationStatuses: any[] = [];

  constructor(
    private httpService: HttpService,
    private httpClient: HttpClient,
    public tokenService: TokenService
  ) {
    // super();
  }

  getAllDatas() {
    this.Get_Industry_Types();
    this.Get_All_Attributes();
    this.Get_All_AttributeTypes();
    this.Get_Package_Types();
    this.Get_Product_Types();
    this.Get_Product_Sub_Types();
    this.Get_All_Conversion_Types();
    this.Get_All_Calculator_Metas();
    this.Get_All_HSN_IND();
    this.Get_All_HSN_USA();
    this.Get_Relation_Status();
  }

  getAllMetaDatas() {
    this.Get_Industry_Types();
    this.Get_All_Attributes();
    this.Get_All_AttributeTypes();
    this.Get_All_Conversion_Types();
    this.Get_All_HSN_IND();
    this.Get_All_HSN_USA();
    this.Get_Customer_Categories();
    this.Get_Relation_Status();
  }

  // Get All HSN INDIA
  Get_All_HSN_IND() {
    this.httpService
      .get(productTemplate.getAllHsnIndia)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.hsnIndiaList = [];
        this.hsnIndiaList = res;
      });
  }

  // Get All HSN INDIA
  Get_All_Calculator_Metas() {
    this.httpService
      .get(productTemplate.calculator_meta)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.allCalculatorMetas = [];
        this.allCalculatorMetas = res;
        this.calculatorMetaLoaded.setValue(true);
      });
  }
  // Get All META WITHOUT CACHING
  Get_All_Calculator_Metas_Non_Cache() {
    this.httpService
      .get(productTemplate.calculator_meta, { noncache: true })
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.allCalculatorMetas = [];
        this.allCalculatorMetas = res;
        this.calculatorMetaLoaded.setValue(true);
      });
  }
  // post meta
  addCalculatorMeta(data: any) {
    return this.httpService
      .post(productTemplate.add_calculator_meta, data)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  // Get All HSN USA
  Get_All_HSN_USA() {
    this.httpService
      .get(productTemplate.getAllHsnUsa)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.hsnUSAList = [];
        this.hsnUSAList = res;
      });
  }

  // Get All Customers

  // Get All Products
  Get_Product_ById(id: any) {
    if (!id) {
      return;
    }
    return this.httpService
      .get(productTemplate.getSingleProduct + '/' + id)
      .toPromise();
  }

  Copy_Product_ById(id: any) {
    return this.httpService
      .get(productTemplate.copySingleProduct + '/' + id)
      .toPromise();
  }

  Copy_ProductForCustomer_ById(id: any, customerId: any) {
    return this.httpService
      .get(
        `${productTemplate.copySingleProductForCustomer}/${id}?customerId=${customerId}`
      )
      .toPromise();
  }

  Get_Product_Type_ById(id: any) {
    return this.httpService
      .get(productTemplate.getProductTypeById + id)
      .toPromise();
  }

  Get_Product_Sub_Type_ById(id: any) {
    return this.httpService
      .get(productTemplate.getProductSubTypeById + id)
      .toPromise();
  }

  Get_Process_ById(id: any) {
    return this.httpService
      .get(productTemplate.getProcessById + id)
      .toPromise();
  }

  // Get Product Types
  Get_Product_Types(searchText?: string) {
    this.httpService
      .get(productTemplate.getProductType, { searchString: searchText ?? '' })
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .subscribe((res) => {
        this.productTypes = [];
        this.productTypes = res;
      });
  }

  // Get Product Types
  Get_Product_Sub_Types() {
    this.httpService
      .get(productType.getAllProductSubType)
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.productSubTypes = [];
        this.productSubTypes = res;
      });
  }

  // Get Package Types
  Get_Package_Types() {
    this.httpService
      .get(productTemplate.getPackageType)
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .subscribe((res) => {
        this.packageTypes = [];
        this.packageTypes = res;
      });
  }

  // Get Industry Types
  Get_Industry_Types(searchText?: string) {
    return this.httpService
      .get(productTemplate.getIndustryType, { searchString: searchText ?? '' })
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .toPromise()
      .then((res) => {
        this.allIndustryTypes = [];
        this.allIndustryTypes = res;
      });
  }

  Get_Relation_Status() {
    return this.httpService
      .get(relationAccountApis.getRelationStatus)
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .toPromise()
      .then((res) => {
        this.allRelationStatuses = [];
        this.allRelationStatuses = res;
      });
  }

  // Get Customer Categories
  Get_Customer_Categories(searchText?: any) {
    return this.httpService
      .get(`${productType.productCategory}`, { searchString: searchText ?? '' })
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .toPromise()
      .then((res) => {
        this.productCategoriesList = [];
        this.productCategoriesList = res;
      });
  }

  // Get Customer Categories
  Get_Categories_DetailByIds(productCategoryIds: any[]) {
    return this.httpService
      .get(
        `${productType.getCategoryDetailByIds
        }?productCategoryIds=${productCategoryIds.join(',')}`
      )
      .pipe(
        map((res) => {
          return res as any[];
        })
      );
  }

  // Get Product Templates By Search
  Get_Product_Template_By_Search(
    pageNumber: any,
    pageS: any,
    sort: any,
    searchString: String = '',
    uomQuery: String = ''
  ): Observable<any> {
    let apiUrl =
      productTemplate.getPagedProductTemplate +
      `?${uomQuery}&page=${pageNumber}&size=${pageS}&sort=${sort}`;
    if (searchString != '') {
      apiUrl += `&searchString=${searchString}`;
    }
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  // Get all Product Templates

  Get_Single_Product_Template(id: any, uomQuery?: any) {
    if (!id) {
      return;
    }
    let url: any = productTemplate.getSingleProductTemplate + id;
    if (uomQuery) {
      uomQuery = encodeURI(uomQuery);
      url = url + '?' + uomQuery;
    }
    return this.httpService.get(url).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  calculate_waste_options(payload: any): Observable<any[]> {
    return this.httpService.post(productTemplate.wasteOption, payload).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  // Save Product Template
  Save_Product_Template(data: any): Observable<any[]> {
    return this.httpService.post(productTemplate.addProductTemplate, data).pipe(
      map((res) => {
        return res as any;
      })
    );
  }
  delete_Product_Template(id: any): Observable<any[]> {
    return this.httpService
      .delete(productTemplate.addProductTemplate + '/' + id)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  // Get all Conversion Types
  Get_All_Conversion_Types() {
    this.conversionTypes = [];
    return this.httpService
      .get(productTemplate.getAllConversionTypes)
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .subscribe((res) => {
        this.conversionTypes = res;
      });
  }

  Get_Related_PO_Details(id: any, uomQuery?: any) {
    let url: any = productTemplate.getRelatedPoDetail + id + '/relatedProduct';
    if (uomQuery) {
      uomQuery = encodeURI(uomQuery);
      url = url + '?' + uomQuery;
    }
    return this.httpService.get(url).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  // Purchase history for products/categories
  Get_Purchase_History(body: any): Observable<any> {
    try {
      return this.httpService.post<any>(productTemplate.getPurchaseHistory, body).pipe(
        map((res: any) => {
          return res as any;
        })
      );
    } catch (e) {
      // wrap as observable error
      return new Observable((subscriber) => {
        subscriber.error(e);
      });
    }
  }

  // Get all Attributes
  Get_All_Attributes(): Promise<any[]> {
    this.allAttributes = [];
    return this.httpService
      .get(productTemplate.getAllAttributes)
      .pipe(
        map((res) => res as any[]) // Transform response
      )
      .toPromise() // Convert Observable to Promise
      .then((res) => {
        this.allAttributes = res;
        // Modify attributes as required
        this.allAttributes.forEach((item) => {
          if (!item.description?.includes('Customizable')) {
            item.description += [46, 47, 48, 49, 50, 51].includes(item.id)
              ? ' (Customizable)'
              : '';
          }
        });
        return res; // Return data for further chaining if needed
      });
  }

  // Get all Attribute Types
  Get_All_AttributeTypes() {
    this.allAttributesTypes = [];
    return this.httpService
      .get(productTemplate.getAllAttributesTypes)
      .pipe(
        map((res) => res as any[]) // Transform response
      )
      .toPromise() // Convert Observable to Promise
      .then((res) => {
        this.allAttributesTypes = res;
        return res; // Return data for further chaining if needed
      });
  }

  metricCalculator(payload: any): Observable<any[]> {
    return this.httpService
      .post(productTemplate.matricCalculator, payload)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  // Calculate TEmplate values
  calculateTemplateValues(payload: any): Observable<any[]> {
    return this.httpService
      .post(productTemplate.template_calculate_values, payload)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  getDataByAttr(arr, attr, value) {
    var index = arr.findIndex((x) => x[attr] === value);
    return arr[index];
  }

  removeByAttr(arr, attr, value) {
    var i = arr.length;
    while (i--) {
      if (
        arr[i] &&
        arr[i]?.hasOwnProperty(attr) &&
        arguments.length > 2 &&
        arr[i][attr] === value
      ) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }

  // Get all Processes
  async Get_All_Processes(uomQuery: any) {
    const res: any = await this.httpService
      .get(
        productTemplate.getAllProcesses + '?' + uomQuery + '&page=0&size=100'
      )
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .toPromise();
    this.processList = res;
  }

  async Get_All_Product_List_Uom_Based(uomQuery: any) {
    const res: any = await this.httpService
      .get(
        productTemplate.getAllProductsForProcess +
        '?' +
        uomQuery +
        '&page=0&size=100'
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .toPromise();
    this.allproductsListForProcess = res?.content;
  }

  Get_All_Product_List_IsPackage(uomQuery: any, query: any) {
    const url =
      productTemplate.getAllProductAll +
      '?isPackagingMaterial=true&' +
      uomQuery +
      '&searchString=' +
      query;
    return this.httpService.get(url).pipe(
      map((res: any) => {
        this.allproductsWithIsPackage = res?.content;
        return res as any;
      })
    );
  }

  filterArray(array: any[], attributeName: string, filterValue: number = null) {
    if (array?.length > 0) {
      const result: any[] = array?.filter((item: any) => {
        if (filterValue != null) {
          if (item[attributeName] === filterValue) {
            return item;
          }
        } else {
          return item;
        }
      });
      return result;
    } else {
      return [];
    }
  }

  // Save Template info

  saveTemplateInfo(data: any) {
    if (data.id == null || data.id == '') {
      delete data.id;
    }
    return this.Save_Product_Template(data).toPromise();
  }

  // Save Process List

  async saveProcessList(templateinfo: any) {
    if (templateinfo.id == null || templateinfo.id == '') {
      delete templateinfo.id;
    }
    const newData: any = this.cleanData(templateinfo);
    const data = await this.Save_Product_Template(newData).toPromise();
    return data;
  }

  cleanData(data) {
    if (typeof data != 'object') return;
    if (!data) return; // null object
    for (const key in data) {
      if (
        typeof data[key] != 'object' ||
        (typeof data[key] == 'object' && data[key] == null)
      ) {
        if (key === 'id' && data[key] === null) {
          delete data[key];
        }
        if (key === 'existingProcessId' && data[key] === 0) {
          delete data[key];
        }
        if (key === 'existingProcessId' && data[key] === null) {
          delete data[key];
        }
        if (key === 'subProductId' && data[key] === 0) {
          delete data[key];
        }
        // for removing null in array

        if (key === 'processConversionAttributeValues' && data[key] === null) {
          data[key] = [];
        }
        if (key === 'processProductAttributeValues' && data[key] === null) {
          data[key] = [];
        }

        if (key === 'processConversionTypes' && data[key] === null) {
          data[key] = [];
        }

        if (key === 'additionalCosts' && data[key] === null) {
          data[key] = [];
        }

        if (key === 'packages' && data[key] === null) {
          data[key] = [];
        }

        if (key === 'images' && data[key] === null) {
          data[key] = [];
        }

        if (key === 'productCalculatorAttributeValues' && data[key] === null) {
          data[key] = [];
        }

        if (key === 'packageCalculatorTemplates' && data[key] === null) {
          data[key] = [];
        }
        if (key === 'productAttributeValues' && data[key] === null) {
          data[key] = [];
        }

        if (key === 'packageCalculatorTemplates' && data[key] === null) {
          data[key] = [];
        }

        // end
        if (
          key === 'existingProcessId' &&
          data[key] != 0 &&
          data[key] != null &&
          data[key] != 'null'
        ) {
          delete data.process;
        }

        // if (
        //   data[key]?.attributeValue == 0 ||
        //   data[key]?.attributeValue == null
        // ) {
        //   data[key] == null;
        // }
      } else if (Array.isArray(data[key])) {
        data[key].forEach((item: any) => {
          this.cleanData(item);
        });
      } else if (typeof data[key] == 'object' && data[key] != null) {
        this.cleanData(data[key]);
      }
    }

    return data;
  }

  // Get Product Templates By Search
  Get_Product_List_By_Search(
    pageNumber: any,
    pageS: any,
    sort: any,
    uomQuery: any = '',
    searchString: String = '',
    filter: String = ''
  ): Observable<any[]> {
    let apiUrl =
      productTemplate.getAllProductList +
      `?${uomQuery}&page=${pageNumber}&size=${pageS}&sort=${sort}`;
    if (searchString) {
      const encodedSearchString = encodeURIComponent(searchString as string);
      apiUrl += `&searchString=${encodedSearchString}`;
    }
    if (filter) {
      apiUrl += `&filter=${filter ?? ''}`;
    }

    if (
      apiUrl?.includes("status:'DELETED'") &&
      apiUrl?.includes("status!'DELETED'")
    ) {
      apiUrl = apiUrl.replace("&filter=status!'DELETED'", '');
    }

    if (apiUrl?.includes('&filter=null')) {
      apiUrl = apiUrl.replace('&filter=null', '');
    }

    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  // uploadFile(file: any) {
  //   const uFrm = new FormData();
  //   uFrm.append('file', file);
  //   return this.httpClient
  //     .post(environment.apiUrl + `resources/upload/files`, uFrm, {
  //       responseType: 'text',
  //     })
  //     .toPromise();
  // }

  uploadFiles(files: any) {
    const formData = new FormData();
    for (let index = 0; index < files.length; index++) {
      const element = files[index];
      formData.append('files', element);
    }
    return this.httpClient
      .post(`${environment.apiUrl}resources/upload/files`, formData)
      .toPromise();
  }

  deleteFiles(file_name: any) {
    return this.httpClient
      .delete(
        environment.apiUrl + `resources/delete/files?file_names=` + file_name
      )
      .toPromise();
  }

  downloadFile(fileName: any) {
    return this.httpClient.get(
      environment.apiUrl + `resources/downloadfile/${fileName}`,
      {
        responseType: 'blob',
      }
    );
  }

  // Calculate Product
  calculateProductValues(data: any) {
    return this.httpService
      .post(productTemplate.calculate_values, data)
      .toPromise();
  }

  // Save Product
  saveProductValues(data: any) {
    return this.httpService
      .post(productTemplate.addSingleProduct, data)
      .toPromise();
  }

  delete_Product(id: any) {
    return this.httpService
      .delete(productTemplate.addSingleProduct + id)
      .toPromise();
  }

  // Fetch Competitor Prices
  fetchCompetitorPrices(productId: any) {
    return this.httpService
      .get(productTemplate.fetchCompetitorPrices + productId + '/competitors/fetch-prices', null)
      .toPromise();
  }

  cleanDataId(data) {
    if (typeof data != 'object') return;
    if (!data) return; // null object
    for (const key in data) {
      if (
        typeof data[key] != 'object' ||
        (typeof data[key] == 'object' && data[key] == null)
      ) {
        if (key == 'id') {
          data[key] = null;
        }
        if (key === 'existingProcessId') {
          data[key] = 0;
        }
      } else if (Array.isArray(data[key])) {
        data[key].forEach((item: any) => {
          this.cleanDataId(item);
        });
      } else if (typeof data[key] == 'object') {
        this.cleanDataId(data[key]);
      }
    }

    return data;
  }

  // Get Preference
  getPreferredUoms() {
    return this.httpService.get(apiModules.get_preference).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  // Set Preference
  setPreferredUoms(data) {
    return this.httpService.post(apiModules.set_preference, data).toPromise();
  }

  //Get All Customer List
  Get_All_Customers(
    searchText: any,
    pageNumber: any,
    pageS: any,
    sort: any,
    employeeId: any,
    filterQuery: any
  ): Observable<any> {
    let apiUrl =
      customer.getAllCustomerList +
      `?searchString=${searchText}&page=${pageNumber}&size=${pageS}&sort=${sort}&filter=businessCategory:'CUSTOMER'&noncache=true`;

    if (employeeId) {
      apiUrl = apiUrl + "&filter=assignedSalesId~'*%23" + employeeId + "%23*'";
    }
    if (filterQuery) {
      apiUrl = apiUrl + `&filter=${filterQuery}`;
    }
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  //Get All Customer List
  Get_All_Lcp(
    searchText: any,
    pageNumber: any,
    pageS: any,
    sort: any,
    employeeId: any,
    filterQuery: any
  ): Observable<any> {
    let apiUrl =
      customer.getAllCustomerList +
      `?searchString=${searchText}&page=${pageNumber}&size=${pageS}&sort=${sort}&filter=businessCategory in ('CUSTOMER','LEAD','PROSPECT')&noncache=true`;

    if (employeeId) {
      apiUrl = apiUrl + "&filter=assignedSalesId~'*%23" + employeeId + "%23*'";
    }
    if (filterQuery) {
      apiUrl = apiUrl + `&filter=${filterQuery}`;
    }
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  //Get All vendor List
  Get_All_Vendors(
    searchText: any,
    pageNumber: any,
    pageS: any,
    sort: any
  ): Observable<any> {
    let apiUrl =
      customer.getAllCustomerList +
      `?searchString=${searchText}&filter=businessCategory:'VENDOR'&page=${pageNumber}&size=${pageS}&sort=${sort}&noncache=true`;

    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  //Get All leads List
  Get_All_Leads(
    searchText: any,
    pageNumber: any,
    pageS: any,
    sort: any,
    employeeId: any,
    filterQuery: any
  ): Observable<any> {
    let apiUrl =
      customer.getAllCustomerList +
      `?searchString=${searchText}&page=${pageNumber}&size=${pageS}&sort=${sort}&filter=businessCategory:'LEAD'&noncache=true`;
    if (employeeId) {
      apiUrl = apiUrl + "&filter=assignedSalesId~'*%23" + employeeId + "%23*'";
    }
    if (filterQuery) {
      apiUrl = apiUrl + `&filter=${filterQuery}`;
    }
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }
  //Get All propects List
  Get_All_Prospects(
    searchText: any,
    pageNumber: any,
    pageS: any,
    sort: any,
    employeeId: any,
    filterQuery: any
  ): Observable<any> {
    let apiUrl =
      customer.getAllCustomerList +
      `?searchString=${searchText}&page=${pageNumber}&size=${pageS}&sort=${sort}&filter=businessCategory:'PROSPECT'&noncache=true`;
    if (employeeId) {
      apiUrl = apiUrl + "&filter=assignedSalesId~'*%23" + employeeId + "%23*'";
    }
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  saveCustomerDetail(request: any) {
    return this.httpService
      .post<any>(`${customer.saveCustomerDetail}`, request)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  //Get Single Customer
  Get_Single_customer(id: any) {
    return this.httpService.get(customer.getAllCustomerList + id).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  //Get Single Customer
  Get_ALl_Transaction_Categories() {
    return this.httpService.get(orderConfigModule.transactionCategories).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  // Get All PayPal
  Get_All_PayPal() {
    return this.httpService.get(invoiceConfigModule.getAllPaypal).pipe(
      map((res) => {
        return res as any[];
      })
    );
  }

  savePaypal(request: any) {
    return this.httpService
      .post<any>(`${invoiceConfigModule.savePayPal}`, request)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  Get_All_Venmo() {
    return this.httpService.get(invoiceConfigModule.getAllVenmo).pipe(
      map((res) => {
        return res as any[];
      })
    );
  }

  Get_All_Bank() {
    return this.httpService.get(invoiceConfigModule.getAllBank).pipe(
      map((res) => {
        return res as any[];
      })
    );
  }

  saveVenmo(request: any) {
    return this.httpService
      .post<any>(`${invoiceConfigModule.saveVenmo}`, request)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  saveBank(request: any) {
    return this.httpService
      .post<any>(`${invoiceConfigModule.saveBank}`, request)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  getPayPalByID(id) {
    return this.httpService.get(invoiceConfigModule.getPayPalById + id).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getVenmoByID(id) {
    return this.httpService.get(invoiceConfigModule.getVenmoById + id).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getBankByID(id) {
    return this.httpService.get(invoiceConfigModule.getBankById + id).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getInvoiceByID(id) {
    return this.httpService.get(invoiceConfigModule.getInvoiceById + id).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getAllCategory() {
    return this.httpService.get(invoiceConfigModule.getAllCategory).pipe(
      map((res) => {
        return res as any[];
      })
    );
  }

  getAllSubCategory() {
    return this.httpService.get(invoiceConfigModule.getAllsubCategory).pipe(
      map((res) => {
        return res as any[];
      })
    );
  }

  saveSubCategory(request) {
    return this.httpService
      .post<any>(`${invoiceConfigModule.saveSubCategory}`, request)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  saveInvoice(request) {
    return this.httpService
      .post<any>(`${invoiceConfigModule.saveInvoice}`, request)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  saveCategory(request) {
    return this.httpService
      .post<any>(`${invoiceConfigModule.saveCategory}`, request)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  getPreviousSalesData(productId: number, businessAccountId: number) {
    return this.httpService
      .get(
        `${invoiceConfigModule.getLastInvoice}/${productId}/last-sales-invoices?businessAccountId=${businessAccountId}`
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  getPreviousPurchasesData(productId: number, businessAccountId: number) {
    return this.httpService
      .get(
        `${invoiceConfigModule.getLastInvoice}/${productId}/last-purchase-bills?businessAccountId=${businessAccountId}`
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  getInventoryLedgerData(productId: number, businessAccountId: number) {
    return this.httpService
      .get(
        `${invoiceConfigModule.getInventoryLedger}/${productId}/last-inventory-details`
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  aiGenerateSeo(payload: any) {
    return this.httpService.post(apiModules.aiGenerateSeo, payload).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  aiGenerateImage(payload: any) {
    return this.httpService.post(apiModules.aiGenerateImage, payload).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  saveProductionLog(payload: any) {
    return this.httpService.post(`${apiModules.productionLogs}/`, payload).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  viewLedger(productId: any, manualAdjustmentOnly: any = false, page: any = 0, size: any = 20, sort: any = 'audit.createdDate%2Cdesc') {
    const apiUrl = `${apiModules.viewLedger}/${productId}/inventoryLedger?manualAdjustmentOnly=${manualAdjustmentOnly}&page=${page}&size=${size}&sort=${sort}`
    console.log(apiUrl);
    return this.httpService.get(apiUrl).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getProductionLogbyId(logId: number) {
    const apiUrl = `${apiModules.productionLogs}/${logId}`;
    return this.httpService.get(apiUrl).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getProductionLogInitialize(productId: number) {
    const apiUrl = `${apiModules.initializeProductionLog}/${productId}`;
    return this.httpService.get(apiUrl).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getProductionLogsList(productId: number, page = 0, size = 500, search: string = '') {
    const searchParam = search ? `&searchString=${encodeURIComponent(search)}` : '';
    const apiUrl = `${apiModules.productionLogsList}?productId=${productId}&page=${page}&size=${size}${searchParam}`;
    return this.httpService.get(apiUrl).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  calculateProductionLogValues(payload: any): Observable<any[]> {
    return this.httpService
      .post(apiModules.calculateProductionLogValues, payload)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }




}
