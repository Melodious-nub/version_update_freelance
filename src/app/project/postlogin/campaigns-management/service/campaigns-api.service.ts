import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from 'src/app/service/token.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignsApiService {
  constructor(private httpClient: HttpClient, private tokenService: TokenService) { }

  private buildAuthHeaders(): HttpHeaders | null {
    try {
      const token = this.tokenService.getAccessToken();
      if (!token) return null;
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    } catch (e) {
      return null;
    }
  }

  generateIntervalCampaign(formData: FormData): Observable<any> {
    const url = `${environment.pyApiUrl}campaigns/interval/generate`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, formData, options);
  }

  generatePersonalizedCampaign(formData: FormData): Observable<any> {
    const url = `${environment.pyApiUrl}campaigns/personalized/generate`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;

    return this.httpClient.post(url, formData, options);
  }

  publishIntervalCampaign(payload: any): Observable<any> {
    const url = `${environment.pyApiUrl}campaigns/interval`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, payload, options);
  }

  publishPersonalizedCampaign(payload: any): Observable<any> {
    const url = `${environment.pyApiUrl}campaigns/personalized`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, payload, options);
  }

  getCampaigns(
    page: number = 1,
    pageSize: number = 20,
    filters?: { status?: string }
  ): Observable<any> {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 20);
    const url = `${environment.pyApiUrl}campaigns/`;

    let params = new HttpParams()
      .set('page', String(safePage))
      .set('page_size', String(safePageSize));

    if (filters?.status) {
      params = params.set('status', String(filters.status).toLowerCase());
    }

    const headers = this.buildAuthHeaders();
    const options: any = { params };
    if (headers) options.headers = headers;
    return this.httpClient.get(url, options);
  }

  getUpcomingCampaigns(
    page: number = 1,
    pageSize: number = 20,
    filters?: { 'interval-type'?: string }
  ): Observable<any> {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 20);
    const url = `${environment.pyApiUrl}campaigns/upcoming`;

    let params = new HttpParams()
      .set('page', String(safePage))
      .set('page_size', String(safePageSize));

    if (filters?.['interval-type']) {
      // ensure lowercase as requested
      params = params.set('interval_type', String(filters['interval-type']).toLowerCase());
    }

    const headers = this.buildAuthHeaders();
    const options: any = { params };
    if (headers) options.headers = headers;
    return this.httpClient.get(url, options);
  }

  getCampaignById(campaignId: number): Observable<any> {
    const safeId = Number(campaignId);
    const url = `${environment.pyApiUrl}campaigns/${safeId}`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.get(url, options);
  }

  getCampaignHistory(campaignId: number): Observable<any> {
    const safeId = Number(campaignId);
    const url = `${environment.pyApiUrl}campaigns/${safeId}/history`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.get(url, options);
  }

  updateCampaign(campaignId: number, payload: any): Observable<any> {
    const safeId = Number(campaignId);
    const url = `${environment.pyApiUrl}campaigns/${safeId}`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.put(url, payload, options);
  }

  regenerateImages(formData: FormData): Observable<any> {
    const url = `${environment.pyApiUrl}campaigns/regenerate_images`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, formData, options);
  }
}
