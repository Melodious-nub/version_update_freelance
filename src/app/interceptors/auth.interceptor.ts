import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private tokenService: TokenService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
  > {
    let token = this.tokenService.getAccessToken();
    // related to guest checkout
    const guestQuickCheckOutRequestUrls = [
      'meta/ports/all',
      'meta/incoterms/all',
      'meta/config/componentuomsettings/withDefault',
      'relationaccounts/',
      'relationaccounts/all',
      'meta/productcategories/all/entity/',
      'products/search/fororder',
      'purchaseorders/calculatevalues',
      'producttypes/all',
      'producttypes/forVendor',
      'products/productDetail',
      'purchaseorders/save',
      'purchaseorders/generate/html',
      'products/get/customTierPricing/byProductIds',
      'ai/read/pdf/forOrder',
      'products/search/forproduct'
    ];

    const checkUrl = request.url?.split('/dadyin-api/')[1]?.split('?')[0];

    const guestQuickCheckOut =
      guestQuickCheckOutRequestUrls.includes(checkUrl) ||
      request.url?.includes('resources/upload/files') ||
      request.url?.includes('resources/uploadfile')
        ? true
        : false;

    // related to guest checkout

    if (token == null && guestQuickCheckOut) {
      token = environment.guestQuickCheckOutToken;
    }

    request = request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // process successful responses here
          }
        },
        (error: any) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401 || error.status === 403) {
            } else if (
              (error.status === 500 &&
                error.error.message ===
                  'User Detail Session is not available for authentication enabled profile') ||
              error?.error?.message?.includes('JWT expired')
            ) {
              localStorage.clear();
              this.router.navigate(['/signin']);
            }
          }
        }
      )
    );
  }
}
