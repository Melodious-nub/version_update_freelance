import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocialBroadcastApiService {
  constructor(private httpClient: HttpClient) {}

  getSocialPosts(
    page = 1,
    pageSize = 10,
    filters?: { status?: string; post_type?: string }
  ): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation`;

    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));

    if (filters?.status) {
      params = params.set('status', String(filters.status));
    }
    if (filters?.post_type) {
      params = params.set('post_type', String(filters.post_type));
    }

    return this.httpClient.get(url, { params });
  }

  // Get social posts by product id
  getSocialPostsByProduct(
    productId: any,
    page = 1,
    pageSize = 20,
    filters?: { status?: string; post_type?: string }
  ): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/by-product/${productId}`;

    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));

    if (filters?.status) {
      params = params.set('status', String(filters.status));
    }
    if (filters?.post_type) {
      params = params.set('post_type', String(filters.post_type));
    }

    return this.httpClient.get(url, { params });
  }
}
