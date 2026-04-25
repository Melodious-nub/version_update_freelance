import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { catchError, map, Observable, retryWhen, throwError } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { inventoryout } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';
import { json } from 'stream/consumers';
import { BusinessAccountService } from '../../../business-account/business-account.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryoutmanagementService {
  private httpService = inject(HttpService);
  private httpClient = inject(HttpClient);
  accountService = inject(BusinessAccountService);

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

  getAllDatas() {}

  Get_Purchase_Order_For_Container(query) {
    return this.httpService
      .get(
        inventoryout.getPurchaseOrderForInventory +
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
        inventoryout.getPurchaseOrderForInventoryProductWise +
          '?' +
          this.objectToQueryParamString(query)
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getSalesOrder(id) {
    return this.httpService.get(inventoryout.getSalesOrderById + id).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  getInventory(id) {
    return this.httpService.get(inventoryout.getInventoryById + id).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  getPalletDetailProductWise(id) {
    return this.httpService.get(inventoryout.getPalletDetail + id).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  getPalletDetailOrderWise(pid) {
    return this.httpService.get(
      inventoryout.getPalletDetailOrderWise + `?pid=${pid}`
    );
  }

  getEmployees() {
    // ${this.accountService.$currentBusinessAccount.value.id}
    return this.httpService
      .get(
        `${inventoryout.getAllEmployee}/${localStorage.getItem(
          'dadyin-business-id'
        )}`
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  calculate(productId, data, selectedPallets?) {
    if (!selectedPallets) {
      return this.httpService.post(
        `${inventoryout.calculate}/${productId}`,
        data
      );
    } else {
      return this.httpService.post(
        `${inventoryout.calculate}/${productId}?selectedPallets=${selectedPallets}`,
        data
      );
    }
  }

  getContainerTypes() {
    return this.httpService.get(inventoryout.getContainerTypes).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  createInventory(data) {
    return this.httpService.post(inventoryout.createInventory, data);
  }

  productWiseSave(pid, data) {
    return this.httpService.post(inventoryout.productWiseSave, data);
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
      inventoryout.productWiseGetInventoryDetails + `?pid=${pid}`
    );
  }

  productWiseCalculate(data) {
    return this.httpService.post(inventoryout.productWisecalculate, data);
  }
}
