import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Country } from 'src/app/model/common/business-account';
import { HttpService } from 'src/app/service/http.service';
import { apiModules, SubscriptionModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private httpService: HttpService) { }

  initiateSubscriptionPayment(data: any) {
    const url = `${SubscriptionModule.initiateSubscriptionPayment}${data.amount}&currency=${data.currency}`;
    return this.httpService.post(url);
  }

  confirmSubscriptionPayment(data: any) {
    return this.httpService.post(SubscriptionModule.confirmSubscriptionPayment, data);
  }

  getCountry(): Observable<Country[]> {
    return this.httpService.get<Country[]>(`${apiModules.get_countries}`);
  }

  getBusinessTypes(): Observable<string[]> {
    return this.httpService.get<string[]>(`${apiModules.get_business_type}`);
  }

  updateBusiness(payload: any): Observable<any> {
    return this.httpService.post(SubscriptionModule.updateBusiness, payload);
  }

  applyPromoCode(payload: any): Observable<any> {
    return this.httpService.post(SubscriptionModule.applyPromoCode, payload);
  }

  removePromoCode(payload: any): Observable<any> {
    return this.httpService.post(`${SubscriptionModule.removePromoCode}${payload}`, );
  }
}


