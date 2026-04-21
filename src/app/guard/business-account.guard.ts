import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { TokenService } from '../service/token.service';

@Injectable({
  providedIn: 'root',
})
export class BusinessAccountGuard implements CanActivate, CanActivateChild {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (
      state.url.startsWith(
        '/home/quick-checkout/order?'
      )
    ) {
      return of(true); // Allow access to 'quick-checkout/order' route
    }
    return this.checkLogin().pipe(
      map((isLoggedIn) => {
        if (
          isLoggedIn &&
          this.tokenService.getBusinessAccountIdToken() &&
          this.tokenService.getRoleInBusinessAccountIdToken()
        ) {
          return true;
        }
        return this.router.createUrlTree(['/home/select-business-account']);
      })
    );
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }

  private checkLogin(): Observable<boolean | UrlTree> {
    if (this.authService.$currentUser.value) {    
      return of(true);
    }
    const redirectUrl = window.location.href.split('#')[1];
    if (redirectUrl && redirectUrl !== '/signin' && redirectUrl !== '/') {
      this.authService.setRedirectUrl(redirectUrl);
    }

    if (
      this.authService.getRedirectUrl() &&
      !this.tokenService.getAccessToken()
    ) {
      this.router.navigateByUrl('/signin')
      return of(true);
    }

    return of(false);
  }
}
