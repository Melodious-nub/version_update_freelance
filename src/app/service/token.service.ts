import { Injectable } from '@angular/core';
const BUSINESS_ACCOUNT_ID_TOKEN = 'dadyin-business-id';
const ROLE_IN_BUSINESS_ACCOUNT_ID_TOKEN = 'roleName';
const AUTH_TOKEN = 'access-token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  public getBusinessAccountIdToken(): string {
    return localStorage.getItem(BUSINESS_ACCOUNT_ID_TOKEN);
  }

  public getAccessToken(): string {
    return localStorage.getItem(AUTH_TOKEN);
  }


  public saveBusinessAccountIdToken(token): void {
    this.removeBusinessAccountIdToken();
    localStorage.setItem(BUSINESS_ACCOUNT_ID_TOKEN, token);
  }


  public removeBusinessAccountIdToken(): void {
    localStorage.removeItem(BUSINESS_ACCOUNT_ID_TOKEN);
    localStorage.removeItem(ROLE_IN_BUSINESS_ACCOUNT_ID_TOKEN);
  }

  public getRoleInBusinessAccountIdToken(): string {
    return localStorage.getItem(ROLE_IN_BUSINESS_ACCOUNT_ID_TOKEN);
  }



  public saveRoleInBusinessAccountIdToken(token): void {
    this.removeRoleInBusinessAccountIdToken();
    if(Array.isArray(token)) {
      token = token[0];
    }

    localStorage.setItem(ROLE_IN_BUSINESS_ACCOUNT_ID_TOKEN, token);
  }

  public removeRoleInBusinessAccountIdToken(): void {
    localStorage.removeItem(ROLE_IN_BUSINESS_ACCOUNT_ID_TOKEN);
  }


  public getAuthToken(): string {
    return localStorage.getItem(AUTH_TOKEN);
  }

  public saveAuthToken(token): void {
    this.removeAuthToken();
    localStorage.setItem(AUTH_TOKEN, token);
  }

  public removeAuthToken(): void {
    localStorage.removeItem(AUTH_TOKEN);
  }

  public removeAll(): void {
    localStorage.clear();
  }
}
