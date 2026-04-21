import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';


@Component({
  selector: 'app-order-arrival',
  templateUrl: './order-arrival.component.html',
  styleUrls: ['./order-arrival.component.scss']
})
export class OrderArrivalComponent implements OnInit {
  poView='orderWise'

  constructor(public route:ActivatedRoute,public router:Router) { }

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
