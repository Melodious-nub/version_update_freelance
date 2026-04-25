import { Component, OnInit, inject, input, output, viewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { sidebarMenu } from 'src/app/shared/menuconstant';
import { SelectMenuService } from '../select-menu.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { TokenService } from 'src/app/service/token.service';
import { DadyinButtonComponent } from '../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle, NgClass } from '@angular/common';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';

@Component({
    selector: 'sidebar-layout',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss'],
    imports: [
        ExtendedModule,
        NgStyle,
        NgClass,
        MatTooltip,
        DadyinButtonComponent
    ]
})
export class SideBarComponent implements OnInit {
  private router = inject(Router);
  private selectMenuService = inject(SelectMenuService);
  private businessAccountService = inject(BusinessAccountService);
  tokenService = inject(TokenService);

  readonly isExpanded = input(true);
  readonly flyerMode = input(false);
  readonly label = input(true);
  sidebarMenus = sidebarMenu;
  readonly sidenav = viewChild<MatSidenav>('sidenav');
  readonly toggleSidebar = output<any>();
  public currentUrl: string = '';
  public sidebarShow: boolean = true;
  onClickwindow: boolean = false;
  isSelected = false;
  isShowing = false;
  reason = '';

  constructor() {
    this.businessAccountService.$currentBusinessAccount.subscribe(
      (res: any) => {
        if (res?.businessLines?.includes('RETAILER')) {
          this.sidebarMenus = this.sidebarMenus.filter(
            (it) => it.label != 'System Config'
          );
          this.sidebarMenus = this.sidebarMenus.filter(
            (it) => it.label != 'Container management'
          );
          const productIndex = this.sidebarMenus.findIndex(
            (menu) => menu.label == 'Products management'
          );
          this.sidebarMenus[productIndex].childs = this.sidebarMenus[
            productIndex
          ].childs.filter((it) => it.label != 'Products Type');
          this.sidebarMenus[productIndex].childs = this.sidebarMenus[
            productIndex
          ].childs.filter((it) => it.label != 'Products Templates');
        }
        if (res?.id == 1) {
          if (this.sidebarMenus.findIndex((menu) => menu.label == 'Users management') === -1) {
            this.sidebarMenus.push({
              id: 50,
              label: 'Users management',
              icon: 'Order management',
              path: '/home/users-management',
              childs: [
                {
                  id: 1,
                  label: 'Users',
                  icon: 'Order management',
                  path: '/home/users-management/users',
                  role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'],
                },
                {
                  id: 2,
                  label: 'Leads',
                  icon: 'Customers',
                  path: '/home/users-management/leads/list?currentStepIndex=2',
                  role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'],
                },
                {
                  id: 3,
                  label: 'Invites',
                  icon: 'Customers',
                  path: '/home/users-management/invites',
                  role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'],
                },
              ],
              role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'],
            })
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.sidebarMenus.forEach((element) => {
      if (element.path == this.currentUrl) {
        this.navigate(element);
      }
      if (element.childs) {
        element.childs.forEach((childs) => {
          if (childs.path == this.currentUrl) {
            this.navigateChild(childs, element);
          }
        });
      }
    });
  }

  navigate(data: any): void {
    this.selectMenuService.changeSelectedMenu(data);
    this.router.navigateByUrl(data.path);
    this.toggleSidebar.emit(false);
  }

  navigateChild(data: any, parent: any): void {
    this.selectMenuService.changeSelectedMenu(parent);
    this.router.navigateByUrl(data.path);
    this.toggleSidebar.emit(false);
  }

  getActiveStatus(link: string) {
    const currentPath = this.router.url.split('?')[0];
    const linkPath = (link || '').split('?')[0];
    if (link == '/home') {
      return currentPath === '/home';
    }
    if (!linkPath) return false;
    // Exact match or current path starts with link path (e.g. .../customers/list or .../customers/edit/5)
    if (currentPath === linkPath || currentPath.startsWith(linkPath + '/')) {
      return true;
    }
    // When link is a "list" path, also match same segment (e.g. .../customers/*)
    if (linkPath.endsWith('/list')) {
      const segmentPath = linkPath.replace(/\/list$/, '');
      return currentPath === segmentPath || currentPath.startsWith(segmentPath + '/');
    }
    return currentPath.startsWith(linkPath);
  }
}
