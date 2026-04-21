import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { HeaderService } from 'src/app/service/header.service';
import { TokenService } from 'src/app/service/token.service';
import { InviteDialogComponent } from 'src/app/shared/component/invite-dialog/invite-dialog.component';
import { sidebarMenu } from 'src/app/shared/menuconstant';
import { SelectMenuService } from '../select-menu.service';
import { environment } from 'src/environments/environment';
import { ChangePasswordDialogComponent } from 'src/app/shared/dialogs/change-password/change-password.component';

@Component({
  selector: 'header-layout',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.notification = false;
  }
  notificationsList: any[] = [];
  unreadNotificationsList: any[] = [];
  userinfo: string;
  notification = false;
  public inviteeGroup: UntypedFormGroup;
  public inviteDetailGroup: UntypedFormGroup;
  public submitted = false;
  public userDetail = { name: null, role: null, branchName: null };
  public businessCategories: string[];
  public businessType: string[];
  public dash_title;
  public disableSubmitBtn = false;
  public sidebarShow: boolean = false;
  public onClickwindow: boolean = false;
  public selectedmenu: any;
  public firstName: '';
  public lastName: '';
  public selectedValue = [];
  logoimage = '';
  currencyDetail: any = {};

  imgUrl = environment.imgUrl;

  NOTIFICATION_ACTIONS = {
    VENDOR_CREATION: '/home/vendor/edit/',
    CUSTOMER_CREATION: '/home/customer/edit/',
    PURCHASE_ORDER_CREATION: '/home/order-management/customer/receivedPo/edit/',
    PURCHASE_ORDER_ACCEPTANCE:
      '/home/order-management/vendor/purchaseorder/edit/',
    PURCHASE_ORDER_REJECTION:
      '/home/order-management/vendor/purchaseorder/edit/',
    SALE_ORDER_CREATION: '/home/order-management/customer/receivedPo/edit/',
    QUOTATION_CREATION: '/home/order-management/vendor/receivedquotation/view/',
    RFQ_CREATION: '/home/order-management/customer/receivedRfq/view/',
    VENDOR_REJECTION: '/home/vendor/edit/',
    CUSTOMER_REJECTION: '/home/customer/edit/',
    VENDOR_ACCEPTANCE: '/home/vendor/edit/',
    CUSTOMER_ACCEPTANCE: '/home/customer/edit/',
    RECEIVED_PURCHASE_ORDER_MODIFICATION:
      '/home/order-management/customer/receivedPo/edit',
  };

  sidebarMenus = sidebarMenu;
  isExpanded = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    public tokenService: TokenService,
    private businessAccountService: BusinessAccountService,
    public dialog: MatDialog,
    public apiService: ApiService,
    private headerService: HeaderService,
    private renderer: Renderer2,
    private selectMenuService: SelectMenuService,
    public route: ActivatedRoute
  ) {
    this.selectMenuService.selectedChildMenu.subscribe((value) => {
      if (value != null) {
        this.selectedmenu = value;
      }
    });
    this.onClickWindow();

    this.headerService.logoChanged.subscribe((value) => {
      if (value) {
        this.businessAccountService.getBusinessAccount();
        this.showLogo();
      }
    });

    this.businessAccountService.$currentBusinessAccount.subscribe(
      (res: any) => {
        this.userDetail = res;
        if (res?.businessLines?.includes('RETAILER')) {
          this.sidebarMenus = this.sidebarMenus.filter(
            (it) => it.label != 'System Config'
          );
        }
        if (res?.id == 1) {
          if (this.sidebarMenus.findIndex((menu) => menu.label == 'Users management') === -1) {
            this.sidebarMenus.push({
              id: 50,
              label: 'Users management',
              icon: 'Order management',
              path: '/home/users-management',
              childs: [
                { id: 1, label: 'Users', icon: 'Order management', path: '/home/users-management/users', role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'] },
                { id: 2, label: 'Leads', icon: 'Customers', path: '/home/users-management/leads/list?currentStepIndex=2', role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'] },
                { id: 3, label: 'Invites', icon: 'Customers', path: '/home/users-management/invites', role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'] },
              ],
              role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'],
            });
          }
          this.setSelectedMenuFromUrl();
        }
      }
    );
  }
  ngOnInit(): void {
    this.setSelectedMenuFromUrl();

    this.router.events.subscribe(() => {
      this.setSelectedMenuFromUrl();
    });

    this.selectMenuService.selectedChildMenu.subscribe((value) => {
      if (value != null) {
        this.selectedmenu = value;
      }
    });

    this.showLogo();
    this.getAllNotifications();
  }

  onClickLogout(): void {
    this.authService.logout();
  }

  onClickToSwitchAccount(): void {
    this.authService.switchAccount();
  }

  onClickChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '50%',
    });
  }

  onClickWindow() {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (!this.onClickwindow) {
        this.sidebarShow = false;
      }
      this.onClickwindow = false;
    });
  }

  onClickSidebar() {
    this.sidebarShow = !this.sidebarShow;
    this.onClickwindow = true;
  }

  onClickBusinessRegistration() {
    this.router.navigateByUrl('/home/business-registration');
  }

  onInviteClick(): MatDialogRef<any> {
    return this.dialog.open(InviteDialogComponent, {
      data: {
        redirectType: '',
        redirectReferenceId: '',
      },
      width: '50%',
    });
  }

  navigate(link: string) {
    this.router.navigateByUrl(link);
  }

  navigateData(data: any): void {
    this.selectMenuService.changeSelectedMenu(data);
    this.router.navigateByUrl(data.path);
  }

  navigateChildData(data: any, parent: any): void {
    this.selectMenuService.changeSelectedMenu(parent);
  }

  async showLogo() {
    this.businessAccountService.$currentBusinessAccount.subscribe((data) => {
      if (data != null) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.logoimage = data.businessLogo;
        this.currencyDetail.lang = data.language?.substring(0, 3).toUpperCase();
        this.currencyDetail.currency = data.currency;
        this.currencyDetail.currency2nd = data.currency2nd;
        this.currencyDetail.currencyrate =
          data.currencyRate == null ? '--' : data.currencyRate;
        this.currencyDetail.currency2ndrate =
          data.currency2ndRate == null ? '--' : data.currency2ndRate;
      }
    });
  }

  getAllNotifications() {
    const accessToken = this.tokenService.getAccessToken();
    if (accessToken) {
      this.businessAccountService.getAllNotifications().subscribe((res) => {
        const unreadList = res?.filter((it) => !it.is_seen);
        const readList = res?.filter((it) => it.is_seen);
        this.unreadNotificationsList = unreadList;
        this.notificationsList = readList;
      });
    }
  }

  onClickNotification(notification) {
    if (notification?.is_seen) {
      this.router.navigateByUrl(
        this.NOTIFICATION_ACTIONS[notification?.bidirectional_action] +
        notification?.reference_id
      );
      this.notification = false;
    }
    else {
      this.businessAccountService
        .changeNotificationSeenStatus(notification?.id)
        .subscribe((res) => {
          if (notification?.reference_id) {
            this.router.navigateByUrl(
              this.NOTIFICATION_ACTIONS[notification?.bidirectional_action] +
              notification?.reference_id
            );
          }
          this.notification = false;
          this.getAllNotifications();
        });
    }
  }

  markAsUnreadNotification(notification) {
    this.businessAccountService
      .changeNotificationSeenStatus(notification?.id)
      .subscribe((res) => {
        this.notification = false;
        this.getAllNotifications();
      });
  }

  createNewBusinessAccount() {
    this.authService.createAccount();
  }

  toggleNotification(type) {
    if (type == true && this.notification == false) {
      this.notification = true;
      this.getAllNotifications();
    } else {
      this.notification = false;
    }
  }

  navigateChild(option): void {
    console.log("===> Header Child Navigation: ", option);
    this.router.navigateByUrl(option.path);
  }

  toggleSidebar(event) {
    this.isExpanded = event;
  }

  isFlyerMode() {
    return this.route.snapshot.queryParams.viewType == 'flyer' ||
      this.route.snapshot.queryParams.productKey
      ? true
      : false;
  }

  /** Match current URL to a menu path (same logic as sidebar) for top bar highlighting */
  isRouteActive(path: string): boolean {
    const currentPath = this.router.url.split('?')[0];
    const linkPath = (path || '').split('?')[0];
    if (!linkPath) return false;
    if (currentPath === linkPath || currentPath.startsWith(linkPath + '/')) {
      return true;
    }
    if (linkPath.endsWith('/list')) {
      const segmentPath = linkPath.replace(/\/list$/, '');
      return currentPath === segmentPath || currentPath.startsWith(segmentPath + '/');
    }
    //Fix DAD-866 Bug #2
    return currentPath === linkPath;
  }

  /** Set selectedmenu from current URL so top bar shows correct parent and highlights active tab */
  private setSelectedMenuFromUrl(): void {
    const currentPath = this.router.url.split('?')[0];
    for (const element of this.sidebarMenus) {
      const elementPath = (element.path || '').split('?')[0];
      if (!elementPath) continue;
      // For root path '/home' only match exactly, so /home/customer/list doesn't match Home first
      const pathMatches =
        currentPath === elementPath ||
        (elementPath !== '/home' && currentPath.startsWith(elementPath + '/'));
      const childMatches =
        element.childs?.length &&
        element.childs.some((c) => c.path && this.isRouteActive(c.path));
      if (pathMatches || childMatches) {
        if (!element.childs?.length) {
          this.selectMenuService.changeSelectedMenu(element);
          return;
        }
        this.selectMenuService.changeSelectedMenu(element);
        return;
      }
    }
  }
}
