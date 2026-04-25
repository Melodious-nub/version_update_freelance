import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { BusinessAccount } from 'src/app/model/common/business-account';
import { UserAccount } from 'src/app/model/common/user-account';
import { AuthService } from 'src/app/service/auth.service';
import { TokenService } from 'src/app/service/token.service';
import { ChooseBusinessAccountService } from './choose-business-account.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { QcmobileDialogComponent } from 'src/app/shared/dialogs/qcmobile/qcmobile-dialog.component';


import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-choose-business-account',
    templateUrl: './choose-business-account.html',
    styleUrls: ['./choose-business-account.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        NgClass,
        ExtendedModule,
        DadyinButtonComponent
    ]
})
export class ChooseBusinessAccountComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private chooseBAService = inject(ChooseBusinessAccountService);
  private toastr = inject(ToastrService);
  dialog = inject(MatDialog);

  public imgUrl = environment.imgUrl;
  public businessAccountGroup: UntypedFormGroup;
  public submitted = false;
  public businessAccounts: BusinessAccount[] = [];
  public selectedBusinessAccountId: number | null = null;
  public userName: string = '';
  public user: UserAccount | null = null;

  @ViewChild('swiperR') swiperR?: ElementRef;
  activeIndex = 0;
  swiperConfig: any = {
    spaceBetween: 15,
    navigation: false,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    }
  };

  constructor() {
    this.user = this.authService.$currentUser.value;
    this.userName = this.user?.email ?? 'Unknown';
  }

  ngAfterViewInit() {
    if (this.swiperR) {
      const swiperEl = this.swiperR.nativeElement;
      Object.assign(swiperEl, this.swiperConfig);
      
      swiperEl.addEventListener('swiperslidechange', (event: any) => {
        this.activeIndex = event.detail[0].realIndex;
      });

      swiperEl.initialize();
    }
  }

  goToSlide(index: number) {
    if (this.swiperR) {
      this.swiperR.nativeElement.swiper.slideToLoop(index);
    }
  }

  ngOnInit(): void {
    this.authService
      .getBusinessAccountByUserId()
      .pipe(first())
      .subscribe(
        (data: BusinessAccount[]) => {
          this.businessAccounts = data || [];
          sessionStorage.setItem('signupData', JSON.stringify({businessAccount: data[0]}));
          if (this.businessAccounts.length === 0) {
            this.router.navigateByUrl('/home/business-details');
            return;
          }

          const storedBusinessAccountId =
            this.tokenService.getBusinessAccountIdToken();

          if (storedBusinessAccountId) {
            this.urlNavigation();
            return;
          }
          if (this.businessAccounts.length === 1) {
            this.selectedBusinessAccountId = this.businessAccounts[0].id;
            this.loginWithBusinessAccount();
          }
        },
        (error) => {
          console.error('Error fetching business accounts:', error);
          this.toastr.error('Something went wrong, please contact support.');
        }
      );
  }

  selectBusinessAccount(id: number): void {
    this.selectedBusinessAccountId = id;
  }

  doubleClickToBusinessAccountLogin(id: number): void {
    this.selectedBusinessAccountId = id;
    this.loginWithBusinessAccount();
  }

  loginWithBusinessAccount(): void {
    if (!this.selectedBusinessAccountId) {
      this.toastr.error('Please select one business account.');
      return;
    }

    const businessAccount = this.businessAccounts.find(
      (obj) => obj.id === this.selectedBusinessAccountId
    );

    if (!businessAccount) {
      this.toastr.error('Invalid business account selection.');
      return;
    }

    this.chooseBAService
      .selectBusinessAccount(this.user?.id || 0, businessAccount.id)
      .subscribe(
        (data) => {
          this.authService.setRoleAndBusinessAccountAndToken(
            data.businessAccountRole,
            data.businessAccountRole.accountId,
            data.accessToken
          );

          if (false) {
            this.dialog
              .open(QcmobileDialogComponent, {
                data: {
                  title:
                    'Mobile experience is currently not available. Please click the option below.',
                  qcData: null,
                },
                panelClass: 'mobile-view-dialog',
              })
              .afterClosed()
              .subscribe(() => this.authService.logout());
            return;
          }

          if (this.authService.quickCheckoutData) {
            this.authService.saveDraftQcOrder();
            return;
          }

          const redirectUrl = this.authService.getRedirectUrl();
          if (redirectUrl) {
            // If you need to refresh, use this method
            this.router.navigateByUrl(redirectUrl).then(() => {
              localStorage.removeItem('redirectUrl');
              window.location.reload(); // Refresh page after redirect
            });
          } else {
            const userRole =
              this.tokenService.getRoleInBusinessAccountIdToken();
            this.redirectBasedOnRole(userRole);
          }
        },
        (error) => {
          console.error('Error during login:', error);
          this.toastr.error('Something went wrong, please contact support.');
          this.submitted = true;
        }
      );
  }

  private redirectBasedOnRole(userRole: string): void {
    let targetUrl = '';
    if (userRole === 'CRM') {
      targetUrl = '/home/lead/list';
    } else {
      const subscriptionPageUrl = sessionStorage.getItem('subscriptionPageUrl') ? JSON.parse(sessionStorage.getItem('subscriptionPageUrl')) : '';
      sessionStorage.removeItem('subscriptionPageUrl');
      if (subscriptionPageUrl) {
        targetUrl = subscriptionPageUrl;
      } else {
        targetUrl = '/home/quick-checkout/order';
      }
    }

    // Navigate first and then reload if the same route needs to be refreshed
    this.router.navigateByUrl(targetUrl).then(() => {
      if (!this.authService.quickCheckoutData) {
        window.location.reload();
      }
    });
  }

  createBusinessAccount(): void {
    this.router.navigateByUrl('/home/business-details');
  }

  urlNavigation() {
    const userRole = this.tokenService.getRoleInBusinessAccountIdToken();
    let targetUrl: any;
    const redirectUrl = this.authService.getRedirectUrl();
    if (redirectUrl) {
      targetUrl = redirectUrl;
    } else {
      if (userRole === 'CRM') {
        targetUrl = '/home/lead/list';
      } else {
        targetUrl = '/home/quick-checkout/order';
      }
    }
    this.router.navigateByUrl(targetUrl).then((res) => {
      localStorage.removeItem('redirectUrl');
    });
  }
}
