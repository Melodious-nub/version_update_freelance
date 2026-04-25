import { Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { map, tap, catchError, timeout } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import { CommonService } from './common.service';

import { environment } from 'src/environments/environment';
import { Http } from '../shared/interfaces';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private httpClient = inject(HttpClient);
    private router = inject(Router);
    private _cs = inject(CommonService);
    private tokenService = inject(TokenService);


    private apiBaseUrl: String = environment.apiUrl;

    authExpired$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    authExpired$$ = this.authExpired$.asObservable();


    private apiCallOptions: Http.ApiCallOptions = {
        showToaster: false,
        showLoader: true
    };

    get = <T>(endpoint: string, body: any = null, headers: any = null, customUrl: boolean = false, options: any = {}): Observable<T | never> => {
     
        if (options.showLoader) {
            this._cs.showHideLoader(true);
        }

        if (options) {
            options = { ...this.apiCallOptions, ...options };
        }

        let params: any = '';
        if (body) {
            params = new URLSearchParams();
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    params.set(key, body[key]);
                }
            }
            params = params.toString() && params.toString() !== '' ? '?' + params.toString() : '';
        }

        if (!customUrl) {
            endpoint = this.apiBaseUrl + endpoint + params;
        } else {
            endpoint = endpoint + params;
        }

        // let _headers = new HttpHeaders();

        const token = this.tokenService.getAccessToken();
        if(token){
          headers = { ...(headers ?? {}), "Authorization" : "Bearer "+this.tokenService.getAccessToken() };
        }

        const httpOptions: any = {};
        if (headers) {
            httpOptions.headers = new HttpHeaders(headers);
        }
        // Allow callers to override default JSON parsing (e.g. plain text responses)
        if (options?.responseType) {
            httpOptions.responseType = options.responseType;
        }
        if (options?.observe) {
            httpOptions.observe = options.observe;
        }

        return (this.httpClient.get(endpoint, httpOptions) as Observable<any>).pipe(
            map((res) => res),
            catchError(this.handleError)
        );
    }

    post = <T>(endpoint: string, body: any = null, customURL: boolean = false, options: any = {}): Observable<T | never> => {

        if (options.showLoader) {
            this._cs.showHideLoader(true);
        }

        if (options) {
            options = { ...this.apiCallOptions, ...options };
        }

        if (!customURL) {
            endpoint = this.apiBaseUrl + endpoint;
        }

        return this.httpClient.post<T>(endpoint, body).pipe(
            map((res) => res),
            catchError(this.handleError)
        );
    }

    put = <T>(endpoint: string, body: any = null, customUrl: boolean = false, options: any = {}): Observable<T | never> => {

        if (options.showLoader) {
            this._cs.showHideLoader(true);
        }

        if (options) {
            options = { ...this.apiCallOptions, ...options };
        }

        if (!customUrl) {
            endpoint = this.apiBaseUrl + endpoint;
        }

        return this.httpClient.put<T>(endpoint, body).pipe(
            map((res) => res),
            catchError(this.handleError)
        );
    }

    patch = <T>(endpoint: string, body: any = null, customUrl: boolean = false, options: any = {}): Observable<T | never> => {

        if (options.showLoader) {
            this._cs.showHideLoader(true);
        }

        if (options) {
            options = { ...this.apiCallOptions, ...options };
        }

        if (!customUrl) {
            endpoint = this.apiBaseUrl + endpoint;
        }

        return this.httpClient.patch<T>(endpoint, body).pipe(
            map((res) => res),
            catchError(this.handleError)
        );
    }

    delete = <T>(endpoint: string, body: any = null, customUrl: boolean = false, options: any = {}): Observable<T | never> => {

        if (options.showLoader) {
            this._cs.showHideLoader(true);
        }

        if (options) {
            options = { ...this.apiCallOptions, ...options };
        }

        let params: any = '';
        if (body) {
            params = new URLSearchParams();
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    params.set(key, body[key]);
                }
            }
            params = params.toString() && params.toString() !== '' ? '?' + params.toString() : '';
        }

        if (!customUrl) {
            endpoint = this.apiBaseUrl + endpoint + params;
        } else {
            endpoint = endpoint + params;
        }

        return this.httpClient.delete<T>(endpoint).pipe(
            map((res) => res),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        // Todo -> Send the error to remote logging infrastructure
        return throwError(error);
    }

    handleCommonError = (err: HttpErrorResponse, options: Http.ApiCallOptions) => {
        let errorObj;
        if (err && err.error && err.error.hasOwnProperty('message')) {
            errorObj = {
                data: err.message,
                message: err.error.message,
                statusCode: err.error.StatusCode
            };
        }
        if (err.status === 500) {
            if (err.error.hasOwnProperty('message')) {
                errorObj = {
                    data: err.message,
                    message: err.error.message,
                    statusCode: err.error.StatusCode
                };
            } else {
                errorObj = {
                    data: 'There was an error. Please contact administrator',
                    message: 'There was an error. Please contact administrator',
                    statusCode: '500'
                };
            }
        }
    }

    openErrorAlert(errorObj: HttpErrorResponse) {
        this._cs.showHideLoader();
        let errorMsg = '';
        if (errorObj.hasOwnProperty('error') && errorObj.error.hasOwnProperty('error') && errorObj.error.error.hasOwnProperty('message')) {
            errorMsg = errorObj?.error?.error?.message;
        } else if (errorObj.hasOwnProperty('error') && errorObj.error.hasOwnProperty('message')) {
            errorMsg = errorObj?.error?.message;
        } else {
            errorMsg = 'Something went wrong. Please contact administrator.';
        }
        this._cs.showAlertDialog({ heading: 'Error', content: errorMsg }).afterClosed().pipe().subscribe((dialogClose: any) => {
            ;
        });
    }
}
