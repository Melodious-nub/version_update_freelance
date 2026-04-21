import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { order, paymentManagement } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentManagementService {
  constructor(private httpService: HttpService) {}

  getPendingPaymentBills(): Observable<any> {
    return this.httpService.get(paymentManagement.pendingPaymentBills).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  initiateInvoicePayment(data: any) {
    const url = `${paymentManagement.initiateInvoicePayment}?amount=${data.amount}&currency=${data.currency}`;
    return this.httpService.post(url);
  }

  saveInvoicePaymentAfterStripe(paymentId: any, invoicesList: any[]) {
    const url = `${paymentManagement.saveInvoicePaymentAfterStripe}?paymentId=${paymentId}`;
    return this.httpService.post(url, invoicesList);
  }

  getHistoryOfPayments(pageIndex, pageSize, sortQuery) {
    return this.httpService
      .get(
        `${paymentManagement.historyOfPayments}?page=${pageIndex}&size=${pageSize}&sort=${sortQuery}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }
}
