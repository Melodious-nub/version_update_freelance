import { Injectable, inject } from '@angular/core';
import {  payment } from 'src/app/shared/constant';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';


@Injectable({ providedIn: 'root' })
export class PaymentService {
    private httpService = inject(HttpService);

    createPaymentIntent(cost: number, currencyCode: string, orderId: string) {
      return this.httpService.post<any>(`${payment.paymentInitiate}`+'?amount='+cost+'&currency='+currencyCode+'&orderId='+orderId);
    }

    paymentOrderConfirm(paymentOrder): Observable<any> {
      return this.httpService.post<any>(`${payment.paymentOrderConfirm}`, paymentOrder);
    }
    
    getPaymentsByOrderId(orderId: number): Observable<any> {
      return this.httpService.get<any>(`${payment.getPaymentsByOrder}`+orderId);
    }

    // getPayment(paymentId): Observable<any> {
    //   return this.httpService.get<any>(`${payment.payment}`+"/by/"+paymentId);
    // }

}
