import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {  map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { inventoryin } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';
import { BusinessAccountService } from '../../../business-account/business-account.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryinmanagementService {
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
  globalCostUom = new UntypedFormControl();
  globalWeightUom = new UntypedFormControl();
  globalVolumeUom = new UntypedFormControl();
  constructor(
    private httpService: HttpService,
    private httpClient: HttpClient,
    public businessAccountService:BusinessAccountService
  ) {}

  getAllDatas() {}

  Get_Purchase_Order_For_Container(query) {
    return this.httpService
      .get(
        inventoryin.getPurchaseOrderForInventory +
          '?' +
          this.objectToQueryParamString(query)
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  Get_Purchase_Order_For_Container_Product_Wise(query) {
    return this.httpService
      .get(
        inventoryin.getPurchaseOrderForInventoryProductWise +
          '?' +
          this.objectToQueryParamString(query)
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getPurchaseOrder(id) {
    return this.httpService.get(inventoryin.getPurchaseOrderById + id).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  getInventory(id) {
    return this.httpService.get(inventoryin.getInventoryById + id).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  getPalletDetailProductWise(id) {
    return this.httpService.get(inventoryin.getPalletDetail + id).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  getPalletDetailOrderWise(poid, pid) {
    return this.httpService.get(
      inventoryin.getPalletDetailOrderWise + `?poid=${poid}&pid=${pid}`
    );
  }

  getEmployees() {
    return this.httpService.get(`${inventoryin.getAllEmployee}/${this.businessAccountService.currentBusinessAccountId}`).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  calculate(data) {
    return this.httpService.post(inventoryin.calculate, data);
  }

  calculateProductWise(data) {
    return this.httpService.post(inventoryin.productWisecalculate, data);
  }

  getContainerTypes() {
    return this.httpService.get(inventoryin.getContainerTypes).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  createInventory(data) {
    return this.httpService.post(inventoryin.createInventory, data);
  }

  productWiseSave(pid,data) {
    return this.httpService.post(inventoryin.productWiseSave, data);
  }

  objectToQueryParamString(obj: { [key: string]: any }): string {
    const queryParams = new URLSearchParams();
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            queryParams.append(key, item.toString());
          });
        } else {
          queryParams.set(key, value.toString());
        }
      }
    });
    return queryParams.toString();
  }

  getProductWiseInventoryDetails(pid: any) {
    return this.httpService.get(
      inventoryin.productWiseGetInventoryDetails + `?pid=${pid}`
    );
  }

  productWiseCalculate(data) {
    return this.httpService.post(inventoryin.productWisecalculate, data);
  }
}
