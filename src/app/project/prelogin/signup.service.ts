import { Injectable } from '@angular/core';
import { SignupUser } from 'src/app/model/signup/SignupUser';
import { environment } from 'src/environments/environment';
import { apiModules, userApiModules } from 'src/app/shared/constant';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { GenricResponse } from 'src/app/model/common/generic-response';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class SignupService {

  constructor(private httpService: HttpService, private http: HttpClient) { }

  register(signup: any): Observable<GenricResponse> {
    return this.httpService.post<GenricResponse>(userApiModules.signup, signup);
  }
  registerAndGenerateBusinessAccount(data: any): Observable<GenricResponse> {
    return this.httpService.post<GenricResponse>(userApiModules.registerAndGenerateBusinessAccount, data);
  }
  sendOtpToEmail(signup: any): Observable<GenricResponse> {
    return this.httpService.post<GenricResponse>(`${userApiModules.signup_otp}`, signup);
  }

  validateOtp(signup: SignupUser): Observable<GenricResponse> {
    return this.httpService.post<GenricResponse>(`${userApiModules.signup_validate_otp}`, signup);
  }

  sendResetPasswordLinktoEmailToEmail(email: string): Observable<GenricResponse> {
    return this.httpService.post<GenricResponse>(`${userApiModules.forgot_password}`, email);
  }

  validateResetPassword(resetLink): Observable<GenricResponse> {
    return this.httpService.post<GenricResponse>(`${userApiModules.validate_reset_password}`, resetLink);
  }

  resetPassword(newDetails: SignupUser): Observable<GenricResponse> {
    return this.httpService.post<GenricResponse>(`${userApiModules.reset_password}`, newDetails);
  }

  signin(credentials): Observable<any> {
    return this.httpService.post(environment.authApiUrl + 'api/auth/signin', credentials, true);
  }

  getUserDetailsFromInvite(invitelink): Observable<any> {
    return this.httpService.get(`${userApiModules.get_user_for_invite}` + "?inviteLink=" + invitelink);
  }


  encryptPassword(plainPassword: string): string {
    var secretKey: string = "secretkey12345678901";

    var hash = CryptoJS.SHA1(secretKey);
    var key = CryptoJS.lib.WordArray.create(hash.words.slice(0, 16 / 4));
    const encrypted = CryptoJS.AES.encrypt(plainPassword, key, {
      mode: CryptoJS.mode.ECB,
    }).toString();

    return encrypted;
  }
}
