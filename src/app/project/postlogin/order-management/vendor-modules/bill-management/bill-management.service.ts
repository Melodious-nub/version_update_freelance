import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { invoiceConfigModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root',
})
export class BillManagementService {
  productIndexList = [];
  billsList: any[] = [];
  constructor(private httpService: HttpService) {}

  // API 1: Calculate Bill Values
  calculateBillValues(billPayload: any, uomQuery) {
    const url = `${invoiceConfigModule.calculateInvoice}?${uomQuery}`;
    return this.httpService.post(url, billPayload).toPromise();
  }

  // API 2: Save Bill
  saveBill(billPayload: any, uomQuery) {
    const url = `${invoiceConfigModule.saveInvoice}/?${uomQuery}`;
    return this.httpService.post(url, billPayload).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  deleteBill(id: any) {
    const url = `${invoiceConfigModule.getInvoice}/${id}`;
    return this.httpService.delete(url);
  }

  getBillById(id: any, uomQuery) {
    const url = `${invoiceConfigModule.getInvoice}/${id}?${uomQuery}`;
    return this.httpService.get(url);
  }
  // API 3: Convert PO to Bill
  convertPoToBill(purchaseOrderId: number) {
    const url = `${invoiceConfigModule.convertPoToInvoice}?purchaseOrderId=${purchaseOrderId}`;
    return this.httpService.get(url);
  }

  // API 5: Get Bills (Vendor Side)
  getBillListForVendor(request: any) {
    let url = `${invoiceConfigModule.getBillsListVendor}?page=${
      request.pageNumber ?? 0
    }&size=${request.pageS ?? 100}&sort=${
      request.sortQuery ?? 'date,desc'
    }${request.uomQuery ?? ''}&${request.filter ?? ''}`;
    if (request?.searchString) {
      url = url + '&searchString=' + request?.searchString;
    }
    return this.httpService.get(url);
  }
}
