import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../service/token.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private tokenService: TokenService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const userRole = this.tokenService.getRoleInBusinessAccountIdToken(); // Get the user's role
    if (
      state.url.startsWith(
        '/home/quick-checkout/order?'
      )
    ) {
      return true; // Allow access to 'quick-checkout/order' route
    }
    if (userRole === 'CRM') {
      this.toastr.error(
        'Access Denied: You do not have permission to access this route.'
      );
      return this.router.createUrlTree(['/home/lead/list']); // Redirect correctly
    }

    return true; // Allow access
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.canActivate(childRoute, state); // Apply same logic to child routes
  }
}
