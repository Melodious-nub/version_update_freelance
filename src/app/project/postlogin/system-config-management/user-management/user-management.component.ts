import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from '../../business-account/business-account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UsermanagementComponent implements OnInit {
  public currentMainIndex: number = 0;
  public pageConfig = null;
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'id,desc';
  empName: any;
  public userListings: any = [];
  
  public headers = [];

  public businessAccounts: any[] = [];
  


  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },

    {
      label: 'Accept',
      icon: 'task_alt'
    },
    {
      label: 'Reject',
      icon: 'cancel'
    }
  ];
  


  constructor(
    public businessAccountService: BusinessAccountService,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadListing()
    this.pageConfig = {
      itemPerPage: 20,
      sizeOption: [20, 50, 75, 100],
    };
  }

  loadListing() {
  
  }

  

}
