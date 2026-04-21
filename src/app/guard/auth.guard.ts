import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { catchError, map, Observable, of, skipWhile } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean {
    if (
      state.url.startsWith('/home/quick-checkout/order?') &&
      this.authService.$currentUser.value
    ) {
      return;
    }
    if (
      state.url.startsWith('/home/quick-checkout/order?') &&
      !this.authService.$currentUser.value
    ) {
      return true;
    }
    return this.checkLogin();
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean {
    return this.canActivate(childRoute, state);
  }

  private checkLogin(): Observable<boolean> {
    if (this.authService.$currentUser.value) {
      return of(true);
    }

    return this.authService.$currentUser.pipe(
      skipWhile(
        () =>
          !this.authService.isInitialCallCompleted &&
          this.authService.$currentUser.value === null
      ),
      map((user) => {
        if (!user) {
          const redirectUrl = window.location.href.split('#')[1];
          if (redirectUrl && redirectUrl !== '/signin') {
            localStorage.setItem('redirectUrl', redirectUrl);
          }
          this.router.navigate(['/signin']);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401 || err.status === 403) {
            this.authService.logout();
            this.router.navigate(['/signin']);
          }
        }
        return of(false);
      })
    );
  }
}
