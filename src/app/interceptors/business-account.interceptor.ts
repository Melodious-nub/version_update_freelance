import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../service/token.service';

@Injectable()
export class BusinessAccountInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const tokenBusinessAccountId = this.tokenService?.getBusinessAccountIdToken();
    const tokenRoleInBusinessAccountId = this.tokenService?.getRoleInBusinessAccountIdToken();

    if (tokenBusinessAccountId && tokenRoleInBusinessAccountId) {
      const cloned = request.clone({
        headers: request.headers.set('dadyin-business-id', tokenBusinessAccountId).set('role-id', tokenRoleInBusinessAccountId)
      });

      return next.handle(cloned);
    } else {
      return next.handle(request);
    }
  }
}
