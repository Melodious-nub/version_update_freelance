import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
})
export class CategoryManagementComponent implements OnInit {
  public currentMainIndex: number = 0;
  public pageConfig = null;
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'id,desc';


  public headers = [];




  constructor(
    public toastr: ToastrService,
    public route:ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.currentMainIndex=this.route.snapshot.queryParams.currentStepIndex ?? 0
  }





  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Product Categories',
      badge: 0,
      index: 0,
    }
  ];

  changeMainTab(event) {
    this.currentMainIndex = event;
  }
}
