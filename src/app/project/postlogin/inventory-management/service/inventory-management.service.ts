import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { container } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';
import { BusinessAccountService } from '../../business-account/business-account.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryManagementService {
  url = environment.apiUrl;
  branchesList: any[] = [];
  containerTypesList: any[] = [];
  incoTermsList: any[] = [];
  portsList: any[] = [];
  paymentTermsList: any[] = [];
  importersList: any[] = [];
  employeesList: any[] = [];
  expenseTypes: any[] = [];
  labourList: any[] = [];
  containersList: any[] = [];
  purchaseOrdersList: any[] = [];
  materialList: any[] = [];
  globalCostUom = new FormControl();
  globalWeightUom = new FormControl();
  globalVolumeUom = new FormControl();
  constructor(
    private httpService: HttpService,
    private httpClient: HttpClient,
    public businessAccountService: BusinessAccountService
  ) {}

  getAllDatas() {
    this.Get_All_IncoTerms();
    this.Get_All_Branches();
    this.Get_All_paymentTerms();
    this.Get_All_ports();
    // this.Get_All_importers();
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
      .get(container.getAllContainerTypes + uomQuery)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.containerTypesList = [];
        this.containerTypesList = res;
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

  // Get_All_importers() {
  //     this.httpService
  //         .get(
  //             container.getAllImporters +
  //             '/' +
  //             this.businessAccountService.currentBusinessAccountId
  //         )
  //         .pipe(
  //             map((res: any) => {
  //                 return res as any[];
  //             })
  //         )
  //         .subscribe((res: any) => {
  //             this.importersList = [];
  //             res?.relationAccounts?.VENDOR.forEach((element) => {
  //                 let data: any = {
  //                     id: element?.id,
  //                     relationAccountId: element?.relationAccountId,
  //                     name: element?.relationAccountPrimaryContact?.name,
  //                     description:
  //                         element?.relationAccountPrimaryContact?.name +
  //                         '(' +
  //                         element?.relationAccountPrimaryContact?.email +
  //                         ')',
  //                     address:
  //                         element?.relationAccountPrimaryContact?.city?.name +
  //                         ', ' +
  //                         element?.relationAccountPrimaryContact?.state?.name +
  //                         ', ' +
  //                         element?.relationAccountPrimaryContact?.country?.name +
  //                         ', ' +
  //                         element?.relationAccountPrimaryContact?.zipcode,
  //                 };

  //                 this.importersList.push(data);
  //             });
  //         });
  // }
  Get_All_Containers(
    pageNumber: any,
    pageS: any,
    sort: any,
    uomQuery: any
  ): Observable<any[]> {
    return this.httpService
      .get(
        container.getAllContainers +
          `?page=${pageNumber}&size=${pageS}&sort=${sort}${uomQuery}`
      )
      .pipe(
        map((res: any) => {
          this.containersList = res.content;
          return res as any;
        })
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

  Get_All_purchaseOrders(uomQuery: any) {
    return this.httpService.get(container.getAllPurchaseOrders + uomQuery);
  }

  getContainerById(id: any) {
    return this.httpService.get(`${container.createContainer}/${id}`).pipe(
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
