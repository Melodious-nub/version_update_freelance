import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { container, orderConfigModule } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';
import { BusinessAccountService } from '../../business-account/business-account.service';

@Injectable({
  providedIn: 'root',
})
export class ContainerManagementService {
  url = environment.apiUrl;
  branchesList: any[] = [];
  containerTypesList: any[] = [];
  incoTermsList: any[] = [];
  portsList: any[] = [];
  paymentTermsList: any[] = [];
  employeesList: any[] = [];
  expenseTypes: any[] = [];
  labourList: any[] = [];
  containersList: any[] = [];
  purchaseOrdersList: any[] = [];
  materialList: any[] = [];
  constructor(
    private httpService: HttpService,
    public businessAccountService: BusinessAccountService
  ) {}

  getAllDatas() {
    this.Get_All_IncoTerms();
    this.Get_All_Branches();
    this.Get_All_paymentTerms();
    this.Get_All_ports();
    // this.Get_All_purchaseOrders();
    this.Get_All_employees();
    this.Get_Labour_Details();
    this.Get_All_Expense_Types();
    this.Get_All_Material_List_Full();
  }

  Get_All_Branches() {
    this.httpService
      .get(
        container.getAllBranches +
          '/' +
          this.businessAccountService.currentBusinessAccountId
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.branchesList = [];
        this.branchesList = res;
      });
  }

  Get_All_ContainerTypes(uomQuery: any) {
    this.httpService
      .get(container.getAllContainerTypes + '?' + uomQuery)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.containerTypesList = [];
        this.containerTypesList = res;
        this.containerTypesList = this.containerTypesList.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        function addLengthToContainers(containers: any[]): any[] {
          return containers.map((container) => {
            let heightInMM = container.height.attributeValue;
            let widthInMM = container.width.attributeValue;
            let volumeInMM3 = container.volume.attributeValue;

            // Convert volume from m^3 to mm^3 if necessary
            if (container.volume.userConversionUom === 'm^3') {
              volumeInMM3 *= 1_000_000_000; // Convert cubic meters to cubic millimeters
            }

            // Calculate length using: Length = Volume / (Height × Width)
            let lengthInMM = volumeInMM3 / (heightInMM * widthInMM);

            return {
              ...container,
              dimensions: {
                length: heightInMM,
                width: lengthInMM,
                height: widthInMM,
              },
            };
          });
        }
        const updatedContainers = addLengthToContainers(
          this.containerTypesList
        );
        this.containerTypesList = updatedContainers;
      });
  }

  Get_All_IncoTerms() {
    this.httpService
      .get(container.getAllIncoTerms)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.incoTermsList = [];
        this.incoTermsList = res;
      });
  }

  Get_All_paymentTerms() {
    this.httpService
      .get(container.getAllPaymentTerms)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.paymentTermsList = [];
        this.paymentTermsList = res;
      });
  }

  Get_All_ports(): Promise<any> {
    return this.httpService
      .get(container.getAllPorts)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .toPromise()
      .then((res) => {
        this.portsList = [];
        this.portsList = res;
      });
    // .subscribe((res: any) => {
    //     this.portsList = [];
    //     this.portsList = res;
    // });
  }

  Get_All_Containers(
    pageNumber: any,
    pageS: any,
    sort: any,
    uomQuery: any,
    searchText: any,
    isExport = false
  ): Observable<any> {
    let apiUrl = container.getAllContainers + '?';
    if (uomQuery) {
      apiUrl = apiUrl + uomQuery;
    }
    if (pageNumber) {
      apiUrl = apiUrl + '&page=' + pageNumber;
    }
    if (pageS) {
      apiUrl = apiUrl + '&size=' + pageS;
    }
    if (sort) {
      apiUrl = apiUrl + '&sort=' + sort;
    }
    if (searchText) {
      apiUrl = apiUrl + '&searchString=' + searchText;
    }
    if (isExport) {
      apiUrl =
        apiUrl +
        '&filter=requestFromId:' +
        this.businessAccountService.currentBusinessAccountId;
    } else {
      apiUrl =
        apiUrl +
        '&filter=requestFromId!' +
        this.businessAccountService.currentBusinessAccountId;
    }

    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  Get_All_Container_List(
    pageNumber: any,
    pageS: any,
    sort: any,
    uomQuery: any
  ) {
    let apiUrl = container.getAllContainers + '?';
    if (uomQuery) {
      apiUrl = apiUrl + uomQuery;
    }
    if (pageNumber) {
      apiUrl = apiUrl + '&page=' + pageNumber;
    }
    if (pageS) {
      apiUrl = apiUrl + '&size=' + pageS;
    }
    if (sort) {
      apiUrl = apiUrl + '&sort=' + sort;
    }
    return this.httpService
      .get(apiUrl)
      .pipe(
        map((res: any) => {
          return res;
        })
      )
      .subscribe(
        (res: any) => {
          this.containersList = [];
          this.containersList = res?.content;
        },
        (err) => {
          console.log(err, 'Error in container');
        }
      );
  }

  Get_All_employees() {
    this.httpService
      .get(
        container.getAllEmployee +
          '/' +
          this.businessAccountService.currentBusinessAccountId
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.employeesList = [];
        this.employeesList = res;
      });
  }

  Get_Labour_Details() {
    this.httpService
      .get(container.labourDetails)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.labourList = [];
        this.labourList = res;
      });
  }

  Get_All_PurchaseOrders(uomQuery: any) {
    return this.httpService.get(
      container.getAllPurchaseOrders +
        '?' +
        uomQuery +
        '&sort=audit.createdDate,desc'
    );
  }

  Get_All_Quotations(uomQuery: any) {
    return this.httpService.get(
      container.getAllQuotations +
        '?' +
        uomQuery +
        '&sort=audit.createdDate,desc'
    );
  }

  Get_All_PurchaseOrdersPackages(uomQuery: any, poIds: any) {
    return this.httpService.get(
      container.getAllPurchaseOrderPackages + '?' + uomQuery + '&poIds=' + poIds
    );
  }

  Get_All_QuotationPackages(uomQuery: any, quotationIds: any) {
    return this.httpService.get(
      container.getAllQuotationPackages +
        '?' +
        uomQuery +
        '&quotationIds=' +
        quotationIds
    );
  }

  Get_All_PurchaseOrdersExport(uomQuery: any) {
    return this.httpService.get(
      container.getAllPurchaseOrdersExport +
        '?' +
        uomQuery +
        '&sort=audit.createdDate,desc'
    );
  }

  getContainerById(id: any) {
    return this.httpService.get(`${container.createContainer}/${id}`).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getProductDetailByIds(Ids: any) {
    return this.httpService
      .get(`${orderConfigModule.productDetailIds}?productIds=${Ids}`)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  addUpdateContainer(data: any) {
    return this.httpService.post(container.createContainer, data).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  deleteContainer(id: any) {
    return this.httpService.delete(`${container.deleteContainer}/${id}`).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  calculateContainer(data: any) {
    return this.httpService.post(container.calculateContainer, data).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  Get_All_Expense_Types() {
    this.httpService
      .get(container.getAllExpenseTypes)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.expenseTypes = [];
        this.expenseTypes = res;
      });
  }

  Get_All_Material_List_Full() {
    this.httpService
      .get(container.getAllMaterials)
      .pipe(
        map((res) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.materialList = [];
        this.materialList = res;
      });
  }
}
