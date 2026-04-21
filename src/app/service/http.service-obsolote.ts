import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { map, tap, catchError, timeout } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { CommonService } from './common.service';

import { environment } from 'src/environments/environment';
import { Http } from '../shared/interfaces';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    private apiBaseUrl: String = environment.apiUrl;

    authExpired$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    authExpired$$ = this.authExpired$.asObservable();


    private apiCallOptions: Http.ApiCallOptions = {
        showToaster: false,
        showLoader: true
    };

    constructor(private httpClient: HttpClient, private router: Router, private _cs: CommonService, private tokenService : TokenService) { }

    get = <T>(endpoint: string, body: any = null, headers: any = null, customUrl: boolean = false, options: any = this.apiCallOptions, responseType: string = undefined): Observable<T | never> => {
    
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

        let _headers = new HttpHeaders();

        const token = this.tokenService.getAccessToken();
        if(token){
          headers = {"AccessToken" : this.tokenService.getAccessToken()};
        }

        if (headers) {
            Object.keys(headers).forEach(key => {
                _headers = _headers.set(key, headers[key]);
            });
        }

        let httpOptions = {};
        if (responseType) {
            httpOptions = {
                responseType: 'blob' as 'json',
                headers: _headers
            };
        } else {
            httpOptions = {
                headers: _headers
            };
        }

        return this.httpClient.get<Http.ResponseBody>(endpoint, httpOptions).pipe(
            tap((resp: Http.ResponseBody) => {
                if (options.showLoader) this._cs.showHideLoader();
            }),
            map((resp: any) => {
                return resp;
            }),
            catchError((err: any) => {
                // this.openErrorAlert(err);
                this.handleCommonError(err, options);
                return err;
            })
        );
    }

    post = <T>(endpoint: string, body: any = null, customURL: boolean = false, options: any = {}, maxTime: number = 10000000): Observable<T | never> => {

        if (options.showLoader) {
            this._cs.showHideLoader(true);
        }

        if (options) {
            options = { ...this.apiCallOptions, ...options };
        }

        if (!customURL) {
            endpoint = this.apiBaseUrl + endpoint;
        }

        return this.httpClient.post<Http.ResponseBody>(endpoint, body).pipe(
            timeout(maxTime),
            tap((resp: Http.ResponseBody) => {
                if (options.showLoader) this._cs.showHideLoader();
            }),
            map((resp: any) => {
                return resp;
            }),
            catchError((err: any) => {
                // this.openErrorAlert(err);
                this.handleCommonError(err, options);
                return err;
            })
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

        return this.httpClient.put<Http.ResponseBody>(endpoint, body).pipe(
            tap((resp: Http.ResponseBody) => {
                if (options.showLoader) this._cs.showHideLoader();
            }),
            map((resp: any) => {
                return resp;
            }),
            catchError((err: any) => {
                // this.openErrorAlert(err);
                this.handleCommonError(err, options);
                return err;
            })
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

        return this.httpClient.delete<any>(endpoint).pipe(
            tap((resp: any) => {
                if (options.showLoader) this._cs.showHideLoader();
            }),
            map((resp: any) => {
                return resp;
            }),
            catchError((err: any) => {
                this.openErrorAlert(err);
                this.handleCommonError(err, options);
                return err;
            })
        );
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
