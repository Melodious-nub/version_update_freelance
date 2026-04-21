import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { TokenService } from 'src/app/service/token.service';

@Injectable({
  providedIn: 'root',
})
export class SocialBroadcastDetailsApiService {
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

  getSocialPostDetails(id: string | number): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/${id}`;
    return this.httpClient.get(url);
  }

  approveSocialPost(id: string | number, body: any): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/${id}/approve`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, body, options);
  }

  rejectSocialPost(id: string | number): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/${id}/reject`;
    return this.httpClient.post(url, {});
  }

  updatePostContent(contentId: string | number, body: any): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/content/${contentId}`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.put(url, body, options);
  }

  regenerateImage(postContentId: string | number, body: any): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/${postContentId}/regenerate-image`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, body, options);
  }

  generateManualPostImages(formData: FormData): Observable<any> {
    const url = `${environment.pyApiUrl}manual_post/generate_images`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, formData, options);
  }

  publishSocialPost(postGenerationId: string | number, params: any): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/${postGenerationId}/publish`;
    const headers = this.buildAuthHeaders();
    const options: any = { params };
    if (headers) options.headers = headers;
    return this.httpClient.post(url, {}, options);
  }

  // Delete a social post (requires auth header)
  deleteSocialPost(postId: string | number): Observable<any> {
    const url = `${environment.pyApiUrl}post_generation/${postId}`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.delete(url, options);
  }

  createSocialPost(payload: any): Observable<any> {
    const url = `${environment.pyApiUrl}manual_post`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    return this.httpClient.post(url, payload, options);
  }
}
