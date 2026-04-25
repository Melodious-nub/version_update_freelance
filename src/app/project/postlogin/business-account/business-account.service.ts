import { Injectable, inject } from '@angular/core';
import {
  apiModules,
  container,
  customer,
  orderConfigModule,
  userApiModules,
} from 'src/app/shared/constant';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { BusinessAccounts, User } from 'src/app/model/common/business-account';
import { environment } from 'src/environments/environment';
import { City, Country, State } from 'src/app/model/common/geo';
import { TokenService } from 'src/app/service/token.service';

@Injectable({ providedIn: 'root' })
export class BusinessAccountService {
  private httpService = inject(HttpService);
  tokenService = inject(TokenService);

  /**
   * Default vendor id used for flyer/landing shortcuts.
   * Can be overridden by URL params `vendorId` or `vendorKey`.
   */
  vendorId = 301;
  private readonly vendorKeyToIdMap: Record<string, number> = {
    dayana: 301,
    skventure: 4513,
  };
  vendorListLoaded = new BehaviorSubject<any>(null);
  public $currentBusinessAccount = new BehaviorSubject<any>(null);
  vendorList: any[] = [];
  exportersVendorList: any[] = [];
  customerList: any[] = [];
  lcpList: any[] = [];
  notesList: any[] = [];
  currentBusinessAccountId: any = null;
  currentbusinessLines: any = null;
  employeesList: any[] = [];
  /** Employees with role CRM_SALES only - use for "Assign Sales Rep" dropdowns */
  salesRepList: any[] = [];
  salesRepListForCrmSales: any[] = [];

  constructor() {
    this.applyVendorFromUrl();
    this.currentBusinessAccountId =
      this.tokenService.getBusinessAccountIdToken();

    // Only fetch business account if we actually have an id/token.
    if (this.currentBusinessAccountId && this.currentBusinessAccountId !== 'null') {
      this.getBusinessAccount();
    }
  }

  /**
   * Resolve vendor based on current URL parameters.
   * Supports both hash-routing and normal query params.
   */
  private applyVendorFromUrl(): void {
    // Guard for non-browser contexts.
    if (typeof window === 'undefined') {
      return;
    }

    const fromHash = this.getHashQueryParams();
    const fromSearch = new URLSearchParams(window.location.search || '');

    const vendorIdRaw = fromHash.get('vendorId') ?? fromSearch.get('vendorId');
    const vendorIdParam = vendorIdRaw ? Number(vendorIdRaw) : null;
    if (vendorIdParam && !Number.isNaN(vendorIdParam)) {
      this.vendorId = vendorIdParam;
      return;
    }

    const vendorKeyRaw = fromHash.get('vendorKey') ?? fromSearch.get('vendorKey');
    const vendorKey = (vendorKeyRaw ?? '').trim().toLowerCase();
    if (!vendorKey) {
      return;
    }

    const mappedVendorId = this.vendorKeyToIdMap[vendorKey];
    if (mappedVendorId) {
      this.vendorId = mappedVendorId;
    }
  }

  private getHashQueryParams(): URLSearchParams {
    try {
      const hash = window.location.hash || '';
      const qIndex = hash.indexOf('?');
      if (qIndex === -1) {
        return new URLSearchParams('');
      }
      return new URLSearchParams(hash.substring(qIndex + 1));
    } catch {
      return new URLSearchParams('');
    }
  }

  getBusinessAccount() {
    this.getBusinessAccountDetail().subscribe((res) => {
      this.$currentBusinessAccount.next(res);
      this.currentBusinessAccountId = res?.id;
      this.currentbusinessLines = res?.businessLines;
    }, (err) => {
      this.$currentBusinessAccount.next(null);
      console.log(err)
    });
  }

  saveBusinessAccount(businessAccount: any, userId): Observable<any> {
    return this.httpService.post<any>(
      `${apiModules.register_business_account}` + '/' + userId,
      businessAccount
    );
  }

  deleteRelationAccount(businessAccountId: any): Observable<any> {
    return this.httpService.delete<any>(
      `${apiModules.delete_relation}${businessAccountId}`
    );
  }

  updateBusinessAccount(businessAccount: any): Observable<any> {
    return this.httpService.post<any>(
      `${apiModules.update_business_account}`,
      businessAccount
    );
  }

  /**
   * Register/create a new business (e.g. when adding from Users > All Business).
   * Uses the register endpoint instead of update.
   */
  registerNewBusinessAccount(businessAccount: any): Observable<any> {
    return this.httpService.post<any>(
      `${apiModules.save_business_account_regi}`,
      businessAccount
    );
  }

  /**
   * Check if a shop name is available.
   * API response is expected to be plain text: 'AVAILABLE' | 'TAKEN'
   */
  checkShopNameStatus(shopName: string): Observable<'AVAILABLE' | 'TAKEN'> {
    const encodedShopName = encodeURIComponent((shopName ?? '').trim());
    return this.httpService
      .get<string>(`${apiModules.shop_name_status}/${encodedShopName}/status`, null, null, false, {
        showLoader: false,
        responseType: 'text',
      })
      .pipe(
        map((res: any) =>
          (typeof res === 'string' ? res : `${res ?? ''}`).toUpperCase() as
            | 'AVAILABLE'
            | 'TAKEN'
        )
      );
  }

  getBusinessAccountDetailFromInvite(userId): Observable<BusinessAccounts> {
    return this.httpService.get<BusinessAccounts>(
      `${apiModules.get_business_account_from_invite}` + '/' + userId
    );
  }

  getAllKeywords(searchString?: string): Observable<any> {
    return this.httpService.get<any>(`${apiModules.keywords}`, {
      searchString: searchString,
    });
  }
  getBusinessAccountDetail(baId?: any): Observable<any> {
    const businessAccountId =
      baId ?? this.tokenService.getBusinessAccountIdToken();
    if (!businessAccountId || businessAccountId === 'null') {
      return new Observable((observer) => {
        observer.error('Business Account ID is not available');
        observer.complete();
      });
    }
    return this.httpService.get<any>(
      `${apiModules.get_business_account}` + '/' + businessAccountId
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

  getBusinessAccountsListBySearchTerm(type: any, term: any): Observable<any[]> {
    let query: any = '';
    query = type + "~'" + term + "*'";
    query = encodeURI(query);
    return this.httpService.get<any[]>(
      `${apiModules.get_businessaccounts_byterm}?filter=${query}`
    );
  }

  getAllUsersForFilter(): Observable<User[]> {
    return this.httpService.get<User[]>(`${apiModules.getAllUsers}/forProduct`);
  }
  Get_All_CustomersList() {
    this.httpService
      .get(
        customer.getAllCustomerList + "all?filter=businessCategory:'CUSTOMER'"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.customerList = [];
        this.customerList = res;
      });
  }

  Get_All_Lcp(): Observable<any[]> {
    let apiUrl =
      customer.getAllCustomerList +
      `all?filter=businessCategory in ('CUSTOMER','LEAD','PROSPECT')`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  Get_All_Customers_Non_Cache() {
    this.httpService
      .get(
        customer.getAllCustomerList +
        "all?filter=businessCategory:'CUSTOMER'&noncache=true"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.customerList = [];
        this.customerList = res;
      });
  }

  Get_All_Vendors() {
    this.httpService
      .get(customer.getAllCustomerList + "all?filter=businessCategory:'VENDOR'")
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe({
        next: (res: any) => {
          this.vendorList = [];
          this.vendorList = res;
          this.vendorListLoaded.next(true);
        },
        error: (err) => {
          console.error('Error fetching vendors:', err);
          this.vendorListLoaded.next(false); // Emit false so component doesn't hang
        }
      });
  }

  Get_All_Exporter_Vendors() {
    this.httpService
      .get(
        customer.getAllCustomerList +
        "?filter=businessCategory:'VENDOR'&filter=businessLine:'EXPORTER'"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.exportersVendorList = [];
        this.exportersVendorList = res?.content;
      });
  }

  Get_All_Vendors_Non_Cache() {
    this.httpService
      .get(
        customer.getAllCustomerList +
        "?filter=businessCategory:'VENDOR'&noncache=true"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe({
        next: (res: any) => {
          this.vendorList = [];
          this.vendorList = res?.content;
        },
        error: (err) => console.error('Error fetching vendors non-cache:', err)
      });
  }

  Get_All_Exporter_Vendors_Non_Cache() {
    this.httpService
      .get(
        customer.getAllCustomerList +
        "?filter=businessCategory:'VENDOR'&filter=businessLine:'EXPORTER'&noncache=true"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.exportersVendorList = [];
        this.exportersVendorList = res?.content;
      });
  }

  updateRelationStatus(id: any, status: any): Observable<any> {
    const obj = {
      id: id,
      relationAcceptedStatus: status,
    };
    return this.httpService.post<any>(
      `${apiModules.updateRelationStatus}`,
      obj
    );
  }

  getAllNotifications() {
    return this.httpService.get(`${userApiModules.get_all_notifications}`).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  // Fetch social profiles for the current business account
  getSocialProfiles(): Observable<any> {
    const url = `${environment.pyApiUrl}social-profiles`;
    // Pass `customUrl = true` so HttpService does not prepend the default apiBaseUrl
    return this.httpService.get<any>(url, null, null, true);
  }

  // Delete a social profile connection by connection id
  deleteSocialProfile(connectionId: string | number): Observable<any> {
    const url = `${environment.pyApiUrl}social-profiles/${connectionId}`;
    // use customUrl=true so HttpService doesn't prepend default apiUrl
    return this.httpService.delete<any>(url, null, true);
  }
  Get_All_Notes() {
    this.httpService
      .get(orderConfigModule.getAllNotes)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe({
        next: (res: any) => {
          this.notesList = [];
          this.notesList = res;
          this.notesList.unshift({ id: null, note_title: 'None' });
        },
        error: (err) => console.error('Error fetching notes:', err)
      });
  }
  changeNotificationSeenStatus(id: any) {
    return this.httpService
      .put(`${userApiModules.change_seen_status}?notification_id=${id}`)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getOwner(audit: any) {
    const loggedInAccountId = this.currentBusinessAccountId;
    if (audit?.businessAccountId == 1) {
      return 'M';
    }
    if (audit?.businessAccountId == loggedInAccountId) {
      return 'S';
    } else {
      return 'T';
    }
  }

  getOwnerEnhanced(audit: any, productMetaBusinessId: any) {
    const loggedInAccountId = this.currentBusinessAccountId;

    if (audit?.businessAccountId == 1) {
      return 'M';
    }
    if (audit?.businessAccountId == loggedInAccountId && audit?.businessAccountId == productMetaBusinessId) {
      return 'S';
    } else {
      return 'T';
    }
  }

  getCustomerStats(noOfDays: any) {
    return this.httpService
      .get(`${userApiModules.getCustomerStats}?noOfDays=${noOfDays}`)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getVendorStats(noOfDays: any) {
    return this.httpService
      .get(`${userApiModules.getVendorStats}?noOfDays=${noOfDays}`)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getHomeStats() {
    return this.httpService.get(`${userApiModules.getHomePageStats}`).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }
  Get_All_employees() {
    this.httpService
      .get(container.getAllEmployee + '/' + this.currentBusinessAccountId)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe({
        next: (res: any) => {
          this.employeesList = res ?? [];
          this.salesRepList = (res ?? []).filter(
            (e: any) => e?.roleName === 'CRM'
          );
          this.salesRepListForCrmSales = (res ?? []).filter(
            (e: any) => e?.roleName === 'CRM_SALES'
          );
        },
        error: (err) => console.error('Error fetching employees:', err)
      });
  }
}
