import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { AttributeListComponent } from './product-attributeset/attribute-list/attribute-list.component';
import { MatBadge } from '@angular/material/badge';

import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-order-management',
    templateUrl: './order-management.component.html',
    styleUrls: ['./order-management.component.scss'],
    standalone: true,
    imports: [
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatBadge,
    MatTabContent,
    AttributeListComponent,
    NotesListComponent
],
})
export class OrderManagementComponent implements OnInit {
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
      title: 'Product Attribute Set',
      badge: 0,
      index: 0,
    },
    {
      id: 2,
      title: 'Notes ',
      badge: 0,
      index: 0,
    }
  ];

  changeMainTab(event) {
    this.currentMainIndex = event;
  }
}
