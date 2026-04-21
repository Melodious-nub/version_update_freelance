import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenService } from 'src/app/service/token.service';

export interface SocialProfileConnection {
  id: number;
  platform_id?: number;
  platform_name?: string;
  account_name?: string;
  account_type?: string;
  username?: string;
  linked_email?: string;
  connected_on?: string;
  connection_status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SocialProfilesApiService {
  constructor(private httpClient: HttpClient, private tokenService: TokenService) {}

  private buildAuthHeaders(): HttpHeaders | null {
    try {
      const token = this.tokenService.getAccessToken();
      if (!token) return null;
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    } catch (e) {
      return null;
    }
  }

  getSocialProfiles(): Observable<SocialProfileConnection[]> {
    const url = `${environment.pyApiUrl}social-profiles`;
    const headers = this.buildAuthHeaders();
    return this.httpClient.get<SocialProfileConnection[]>(url, {
      headers: headers ?? undefined,
      observe: 'body',
    });
  }
}
