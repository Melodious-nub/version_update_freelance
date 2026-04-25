import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { invoiceConfigModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root',
})
export class InvoiceManagementService {
  productIndexList = [];
  invoicesList: any[] = [];
  constructor(private httpService: HttpService) {}

  // API 1: Calculate Invoice Values
  calculateInvoiceValues(invoicePayload: any, uomQuery) {
    const url = `${invoiceConfigModule.calculateInvoice}?${uomQuery}`;
    return this.httpService.post(url, invoicePayload).toPromise();
  }

  // API 2: Save Invoice
  saveInvoice(invoicePayload: any, uomQuery) {
    const url = `${invoiceConfigModule.saveInvoice}/?${uomQuery}`;
    return this.httpService.post(url, invoicePayload).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  getInvoiceById(id: any, uomQuery) {
    const url = `${invoiceConfigModule.getInvoice}/${id}?${uomQuery}`;
    return this.httpService.get(url);
  }

  deleteInvoice(id: any) {
    const url = `${invoiceConfigModule.getInvoice}/${id}`;
    return this.httpService.delete(url);
  }

  // API 3: Convert PO to Invoice
  convertPoToInvoice(purchaseOrderId: number) {
    const url = `${invoiceConfigModule.convertPoToInvoice}?purchaseOrderId=${purchaseOrderId}`;
    return this.httpService.get(url);
  }

  // API 5: Get Invoices (Customer Side)
  getInvoicesListForCustomer(request: any) {
    let url = `${invoiceConfigModule.getInvoicesListCustomer}?page=${
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
