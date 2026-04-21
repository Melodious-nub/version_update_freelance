import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from '../../business-account/business-account.service';
import { PaymentManagementService } from '../service/payment-management.service';
@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss'],
})
export class PaymentListComponent implements OnInit {
  @Input('single') single = false;
  paymentList: any[];
  public searchText: string;
  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'audit.lastModifiedDate,desc';
  public headers = [
    { name: 'Payment Date', prop: 'paymentDate', sortable: true },
    {
      name: 'Amount',
      prop: 'amount',
      dataType: 'number',
      decimal: false,
      sortable: true,
    },
    { name: 'Currency', prop: 'currency', sortable: true },
    { name: 'Payment Mode', prop: 'paymentMode', sortable: true },
    { name: 'Payment Id', prop: 'payment_id', sortable: true },
    {
      name: 'Status',
      prop: 'status',
      type: 'status',
      sortable: true,
    }
   
  ];
  currentBusinessAccount;
  constructor(
    public router: Router,
    public apiService: ApiService,
    private business: BusinessAccountService,
    public paymentManagementService: PaymentManagementService
  ) {
    this.business.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });
  }

  ngOnInit() {
    this.loadPaymentList();
  }

  makePayment(): void {
    this.router.navigateByUrl('home/payment-management/add');
  }

  loadPaymentList() {
    this.paymentManagementService
      .getHistoryOfPayments(this.pageIndex, this.pageS, this.sortQuery)
      .subscribe((res) => {
        this.paymentList = res?.content;
        this.pageConfig.totalPages = res?.totalPages;
        this.pageConfig.totalElements = res?.totalElements;
      });
  }

  onInput(searchText: string): void {
    this.searchText = searchText;
    this.ngOnInit();
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.ngOnInit();
    }
  }

 

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.ngOnInit();
  }
}
