import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CategoryListComponent } from './product-categories/category-list/category-list.component';
import { MatBadge } from '@angular/material/badge';

import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-category-management',
    templateUrl: './category-management.component.html',
    styleUrls: ['./category-management.component.scss'],
    imports: [
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatBadge,
        MatTabContent,
        CategoryListComponent
    ]
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
