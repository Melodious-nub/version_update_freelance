import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import {
  RoleInBusiness,
  UserAccount,
  UserInfo,
  UserRoleBusinessAccount,
} from '../model/common/user-account';
import { apiModules } from '../shared/constant';
import { HttpService } from './http.service';
import { TokenService } from './token.service';
import { PurchaseOrderService } from '../project/postlogin/quick-checkout/services/purchase-order.service';
import {
  BusinessAccount,
  BusinessAccountResponse,
} from '../model/common/business-account';
import { ToastrService } from 'ngx-toastr';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { QcmobileDialogComponent } from '../shared/dialogs/qcmobile/qcmobile-dialog.component';
import { GenricResponse } from '../model/common/generic-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // redirectUrl: any = null;
  quickCheckoutData: any = null;
  public isInitialCallCompleted = false;
  public $currentUser = new BehaviorSubject<UserAccount>(null);
  public $currentBusinessAccountUser = new BehaviorSubject<BusinessAccount>(
    null
  );
  switchBusinessAccount: any = false;

  isHandset = false;
  isHandset$: Observable<boolean>;

  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private router: Router,
    public purchaseOrderService: PurchaseOrderService,
    public toastr: ToastrService,
    public dialog: MatDialog,
    public breakpointObserver: BreakpointObserver
  ) {
    this.isHandset$ = this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet,Breakpoints.Medium,Breakpoints.TabletLandscape])
      .pipe(map((result) => result.matches));
    this.isHandset$.subscribe((res) => {
      this.isHandset = res;
    });

    this.getCurrentUser();
  }

  setCurrentUser(currentUser): void {
    if (!currentUser) {
      this.tokenService?.removeBusinessAccountIdToken();
      this.tokenService?.removeRoleInBusinessAccountIdToken();
      this.tokenService.removeAuthToken();
    } else {
      this.setToken(currentUser);
    }
    this.$currentUser.next(currentUser);
  }

  getCurrentUser(): Observable<UserAccount> {
    const tokenBusinessAccountId =
      this.tokenService?.getBusinessAccountIdToken()
        ? '/' + this.tokenService?.getBusinessAccountIdToken()
        : '';
    const tokenRoleInBusinessAccountId =
      this.tokenService?.getRoleInBusinessAccountIdToken()
        ? '/' + this.tokenService?.getRoleInBusinessAccountIdToken()
        : '';

    return this.httpService
      .get<UserInfo>(
        `${apiModules.get_user}${tokenBusinessAccountId}${tokenRoleInBusinessAccountId}`
      )
      .pipe(
        map((result) => {
          let userAccountDetail: UserAccount = {
            email: null,
            password: null,
            firstName: null,
            lastName: null,
            phone: null,
            userRole: null,
            id: null,
            inviteId: null,
            branchId: null,
            branchName: null,
            employeeRole: null,
            employeeId: null,
            externalRefId: null,
            roleId: null,
            roleName: null,
            isEdit: false,
          };
          const response = result ? result : null;
          if (response != null) {
            userAccountDetail.id = Number(response.userId);
            userAccountDetail.email = response.email;
            userAccountDetail.inviteId = response.inviteId;
            userAccountDetail.employeeId = response?.employeeId;
            this.isInitialCallCompleted = true;
            this.setCurrentUserDetails(userAccountDetail);
            return userAccountDetail;
          } else {
            this.setCurrentUser(null);
            return null;
          }
        })
      );
  }

  setCurrentUserDetails(userDetail): void {
    this.$currentUser.next(userDetail);
    if (
      this.router.url.startsWith('/home/quick-checkout/order?') &&
      userDetail
    ) {
      this.router.navigateByUrl('/home');
    }
  }

  setToken(currentUser: UserAccount): void {
    const businessAccounts =
      this.getCurrentUserUserRoleBusinessAccount(currentUser);
    if (businessAccounts.length === 1) {
      const businessAccountId = businessAccounts[0]?.id;
      const roleInBusiness = this.getCurrentUserUserRole(
        businessAccountId,
        currentUser
      );
      if (roleInBusiness.length === 1) {
        const roleInBusinessId = roleInBusiness[0]?.role?.id;
        this.tokenService?.saveBusinessAccountIdToken(businessAccountId);
        if (roleInBusinessId) {
          this.tokenService?.saveRoleInBusinessAccountIdToken(roleInBusinessId);
        }
      }
    }
  }

  getCurrentUserUserRoleBusinessAccount(
    forUser: UserAccount = null
  ): UserRoleBusinessAccount[] {
    const currentUser = forUser ? forUser : this.$currentUser.value;
    let accounts: UserRoleBusinessAccount[] = [];
    if (currentUser && currentUser?.userRole && currentUser?.userRole?.length) {
      for (const userRole of currentUser?.userRole) {
        if (userRole && userRole?.businessAccount) {
          accounts.push(userRole?.businessAccount);
        }
      }
    }
    return accounts;
  }

  getCurrentUserUserRole(
    selectedBusinessAccountId,
    forUser: UserAccount = null
  ): RoleInBusiness[] {
    const currentUser = forUser ? forUser : this.$currentUser.value;
    let roleInBusiness: RoleInBusiness[] = [];
    if (currentUser && currentUser?.userRole && currentUser?.userRole?.length) {
      for (const userRole of currentUser?.userRole) {
        if (
          userRole &&
          userRole?.businessAccount &&
          userRole?.businessAccount?.id === selectedBusinessAccountId
        ) {
          roleInBusiness = userRole?.roleInBusiness;
        }
      }
    }
    return roleInBusiness;
  }

  updateCurrentUser(user: UserAccount): Observable<UserAccount> {
    return this.httpService
      .put<UserAccount>(`${apiModules.logged_in_user}${user?.id}/`, user)
      .pipe(
        map((result) => {
          this.setCurrentUser(result);
          return result;
        })
      );
  }

  logout(): void {
    this.router.navigateByUrl('/signin').then((res) => {
      this.setCurrentUser(null);
      this.tokenService.removeAll();
      this.switchBusinessAccount = false;
      localStorage.clear();
    });
  }

  switchAccount(): void {
    this.tokenService.removeBusinessAccountIdToken();
    this.tokenService.removeRoleInBusinessAccountIdToken();
    this.switchBusinessAccount = true;
    this.router.navigateByUrl('/home/select-business-account');
  }

  createAccount(): void {
    this.tokenService.removeBusinessAccountIdToken();
    this.tokenService.removeRoleInBusinessAccountIdToken();
    this.router.navigateByUrl('/home/business-details');
  }

  setUserDetail(
    currentUser: UserAccount,
    token,
    roles,
    businessAccountId
  ): void {
    this.isInitialCallCompleted = true;
    this.$currentUser.next(currentUser);
    this.tokenService?.saveAuthToken(token);
    this.tokenService?.saveBusinessAccountIdToken(businessAccountId);
    if (roles) {
      this.tokenService?.saveRoleInBusinessAccountIdToken(roles);
    }
  }

  setRoleAndBusinessAccount(roles, businessAccountId, token?): void {
    this.tokenService?.saveBusinessAccountIdToken(businessAccountId);
    if (roles) {
      this.tokenService?.saveRoleInBusinessAccountIdToken(roles);
    }
    if (token) {
      this.tokenService?.saveAuthToken(token);
    }
  }

  setRoleAndBusinessAccountAndToken(
    roles,
    businessAccountId,
    accessToken
  ): void {
    this.tokenService?.saveAuthToken(accessToken);
    this.tokenService?.saveBusinessAccountIdToken(businessAccountId);
    if (roles.userRoles) {
      this.tokenService?.saveRoleInBusinessAccountIdToken(roles.userRoles);
    }
  }

  saveDraftQcOrder() {
    this.quickCheckoutData.requestFrom.id =
      this.tokenService.getBusinessAccountIdToken();
    this.quickCheckoutData.isMobileSignup = this.isHandset;
    this.purchaseOrderService.Post_Order(this.quickCheckoutData).subscribe(
      (res) => {
        this.quickCheckoutData = null;
        // if (this.isHandset) {
        //   this.dialog
        //     .open(QcmobileDialogComponent, {
        //       data: {
        //         title:
        //           'Mobile experience is currently not available.Please click the option below.',
        //         qcData: res,
        //       },
        //       panelClass: 'mobile-view-dialog',
        //     })
        //     .afterClosed()
        //     .subscribe(async (res) => {
        //       this.logout();
        //     });
        //   return;
        // }
        this.setRedirectUrl('/home/quick-checkout/order/' + res?.id);
        window.location.reload();
      },
      (err) => {
        this.toastr.error(err?.error?.message ?? 'Error Occurred');
        this.quickCheckoutData = null;
      }
    );
  }

  getRedirectUrl() {
    const redirectUrl = localStorage.getItem('redirectUrl');
    return redirectUrl;
  }
  setRedirectUrl(value) {
    localStorage.setItem('redirectUrl', value);
  }

  sendInvite(inviteDetail): Observable<GenricResponse> {
    let userId = this.$currentUser.value.id;
    inviteDetail.userId = userId;

    return this.httpService.post<GenricResponse>(
      `${apiModules.send_invite}`,
      inviteDetail,
      false
    );
  }


  getBusinessAccountByUserId(): Observable<BusinessAccount[]> {
    let userId = this.$currentUser.value.id;
    if (!userId) {
      return;
    }
    return this.httpService.get<BusinessAccount[]>(
      `${apiModules.load_business_account}` + userId
    );
  }
}
