import { Injectable } from '@angular/core';
import { apiModules } from 'src/app/shared/constant';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { BusinessAccounts } from 'src/app/model/common/business-account';
import { City, Country, State } from 'src/app/model/common/geo';

@Injectable({ providedIn: 'root' })
export class QuickCheckoutService {
  constructor(private httpService: HttpService) {}

  saveBusinessAccount(
    businessAccount: BusinessAccounts,
    userId
  ): Observable<BusinessAccounts> {
    return this.httpService.post<BusinessAccounts>(
      `${apiModules.register_business_account}` + '/' + userId,
      businessAccount
    );
  }

  getBusinessAccountDetailFromInvite(userId): Observable<BusinessAccounts> {
    if (!userId) {
      return;
    }
    return this.httpService.get<BusinessAccounts>(
      `${apiModules.get_business_account_from_invite}` + '/' + userId
    );
  }

  getBusinessTypes(): Observable<string[]> {
    return this.httpService.get<string[]>(`${apiModules.get_business_type}`);
  }

  getBusinessCategories(): Observable<string[]> {
    return this.httpService.get<string[]>(
      `${apiModules.get_business_categories}`
    );
  }

  getCountry(): Observable<Country[]> {
    return this.httpService.get<Country[]>(`${apiModules.get_countries}`);
  }

  getState(countryId): Observable<State[]> {
    return this.httpService.get<State[]>(
      `${apiModules.get_countries}` + '/' + countryId + '/' + `states`
    );
  }

  getCity(cityId): Observable<City[]> {
    return this.httpService.get<City[]>(
      `${apiModules.get_city}` + '/' + cityId + '/' + `cities`
    );
  }

  getCityByCountry(countryId): Observable<City[]> {
    return this.httpService.get<City[]>(
      `${apiModules.get_cityFrom_country}` + '/' + countryId + '/' + `cities`
    );
  }
}
