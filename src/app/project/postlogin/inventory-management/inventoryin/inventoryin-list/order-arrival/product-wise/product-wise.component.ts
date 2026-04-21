import { Component, OnInit } from '@angular/core';
import { InventoryinmanagementService } from '../../../service/inventoryin-management.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-product-wise',
  templateUrl: './product-wise.component.html',
  styleUrls: ['./product-wise.component.scss']
})
export class ProductWiseComponent implements OnInit {

  list = []
  public filterValue: string;
  startDate = new Date()
  selectedDate = this.startDate
  recentlyAddedList = []
  public orderWiseHeader = [
    { name: 'ID#', prop: 'id', sortable: true },
    { name: 'PRODUCT', prop: 'productCode', sortable: true },
    { name: 'PO/BILL', prop: 'purchaseOrderId', sortable: true },
    { name: 'WH LOCATION', prop: 'dockNumber', sortable: true },
    { name: 'QUANTITY ORDERED', prop: 'quantityOrdered', sortable: true },
    { name: 'QUANTITY RECEIVED', prop: 'quantityReceived', sortable: true },
    { name: 'VERIFIED BY', prop: 'verifierName', sortable: true },
    { name: 'ORDERED ON', prop: 'orderDate', sortable: true },
    { name: 'RETURN TILL', prop: 'returnDate', sortable: true },
    { name: 'STATUS', prop: 'status', type:'status',sortable: true },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];
  public tabelActions: any = [{
    label: 'Edit',
    icon: 'edit'
  }];
  public pageConfig = null;
  constructor(public inventoryinmanagement: InventoryinmanagementService, public router: Router, public route: ActivatedRoute) { }

  ngOnInit(): void {
    
    this.route.queryParams.subscribe(res => {
      if (!res.filter) {
        this.onDateChange(new Date())
      } else {
        this.selectedDate=new Date(res.filter.split('expectedByDate:')[1])
        this.inventoryinmanagement.Get_Purchase_Order_For_Container_Product_Wise(res).subscribe((res: any) => {
          this.list = res.content
   
        })
      }
    })
    let today = new Date()
    const prevseventhDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const year = prevseventhDate.getFullYear();
    const month = ('0' + (prevseventhDate.getMonth() + 1)).slice(-2);
    const day = ('0' + prevseventhDate.getDate()).slice(-2);
    const dateString = `${year}-${month}-${day}`;

    this.inventoryinmanagement.Get_Purchase_Order_For_Container_Product_Wise({ filter: 'audit.createdDate>' + "'" + dateString + 'T00:00:00' + "'" }).subscribe((res: any) => {
      this.recentlyAddedList = res.content
    })
  }



  editRecord(event): void {
    if (event?.data?.id) {
      this.router.navigateByUrl(
        'home/inventory-management/inventoryin/product-wise-create-inventory/' + event.data.id + `?expectedByDate:'${this.route.snapshot.queryParams.filter.split('expectedByDate:')[1]}'`
      );
    }
  }
  

  sort(event) {
    // if (event.active == 'description') {
    //   this.sortQuery = event.active + ',' + event.direction;
    //   this.loadContainersList();
    // }
  }

  pageChange(event) {
    // this.pageIndex = event.pageIndex;
    // this.pageS = event.pageSize;
    // this.loadContainersList();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/inventory-management/inventoryin/product-wise-create-inventory/' + event.row.productId + `?expectedByDate=${this.route.snapshot.queryParams.filter.split('expectedByDate:')[1]}`
          );
        }
        break;
    }
  }

  onDateChange(event) {
    const year = event.getFullYear();
    const month = ('0' + (event.getMonth() + 1)).slice(-2);
    const day = ('0' + event.getDate()).slice(-2);
    const dateString = `${year}-${month}-${day}`;
    const navigationExtras: NavigationExtras = {
      queryParams: { filter: 'expectedByDate:' + "'" + dateString + "'" },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([], navigationExtras);
  }

}
