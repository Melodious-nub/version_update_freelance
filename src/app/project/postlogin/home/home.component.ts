import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectMenuService } from 'src/app/layout/select-menu.service';
import {
  customerList,
  sidebarMenu,
  topList,
  vendorList,
} from 'src/app/shared/menuconstant';
import { BusinessAccountService } from '../business-account/business-account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  menuList = sidebarMenu;
  topList = topList;
  vendorList = vendorList;
  customerList = customerList;
  vendorStats: any;
  customerStats: any;
  homeStats: any;
  customerStatisticsTime: any = 'thismonth';
  vendorStatisticsTime: any = 'thismonth';
  currentBusinessAccount: any;
  imgUrl = environment.imgUrl;
  todayDate = new Date().getDate();
  customerStatisticsTimeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'lastweek', label: 'Last Week' },
    { value: 'thismonth', label: 'This Month' },
    { value: '30days', label: 'Last 30 Days' },
  ];
  constructor(
    private router: Router,
    private selectMenuService: SelectMenuService,
    public businessAccountService: BusinessAccountService
  ) {}

  ngOnInit(): void {
    this.menuList = this.menuList.filter((item) => item !== this.menuList[0]);

    this.getVendorStats();
    this.getCustomerStats();
    this.getHomeStats();
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });
  }

  navigate(data: any): void {
    this.selectMenuService.changeSelectedMenu(data);
    this.router.navigateByUrl(data.path);
  }

  onClickCard(item, type) {
    if (!item?.isActive) {
      return;
    }
    if (type == 'view') {
      if (item.viewpath) {
        this.router.navigateByUrl(item.viewpath);
      }
    } else {
      if (item.addpath) {
        this.router.navigateByUrl(item.addpath);
      }
    }
  }

  getVendorStats() {
    this.businessAccountService
      .getVendorStats(this.getTime(this.vendorStatisticsTime))
      .subscribe((res) => {
        this.vendorStats = res;
      });
  }

  getHomeStats() {
    this.businessAccountService.getHomeStats().subscribe((res) => {
      this.homeStats = res;
    });
  }

  getCustomerStats() {
    this.businessAccountService
      .getCustomerStats(this.getTime(this.customerStatisticsTime))
      .subscribe((res) => {
        this.customerStats = res;
      });
  }

  getTime(type) {
    let time = this.todayDate;
    if (type === 'today') {
      time = 1;
    } else if (type === 'lastweek') {
      time = 7;
    } else if (type === 'thismonth') {
      time = this.todayDate;
    } else if (type === '30days') {
      time = 30;
    }
    return time;
  }

  getCountByVendor(key) {
    if (!key) {
      return '';
    }
    return this.vendorStats[key] ?? null;
  }

  getCountByCustomer(key) {
    if (!key) {
      return '';
    }
    return this.customerStats[key] ?? null;
  }

  navigateUrl(path: any) {
    this.router.navigateByUrl(path);
  }
}
