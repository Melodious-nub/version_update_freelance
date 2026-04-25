import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { InventoryoutOrderWiseComponent } from './order-wise/order-wise.component';
import { InventoryoutProductWiseComponent } from './product-wise/product-wise.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';


@Component({
    selector: 'app-inventoryout-order-arrival',
    templateUrl: './order-arrival.component.html',
    styleUrls: ['./order-arrival.component.scss'],
    imports: [SearchFilterComponent, NgClass, ExtendedModule, InventoryoutProductWiseComponent, InventoryoutOrderWiseComponent]
})
export class InventoryoutOrderArrivalComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);

  poView='orderWise'

  ngOnInit(): void {
    this.route.queryParams.subscribe(res=>{
      if(res.poView && res.poView=='productWise'){
        this.poView='productWise'
      }else{
        this.poView='orderWise'
      }
    })
  }

  changeView(view:any){
    this.poView=view
    const navigationExtras: NavigationExtras = {
      queryParams: { poView: view },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([], navigationExtras);
  }




}
