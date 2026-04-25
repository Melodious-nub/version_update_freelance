import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InactiveBusinessListComponent } from './inactive-business/inactive-business-list/inactive-business-list.component';
import { ActiveBusinessListComponent } from './active-business/active-business-list/active-business-list.component';
import { AllBusinessListComponent } from './all-business/all-business-list/all-business-list.component';
import { MatBadge } from '@angular/material/badge';

import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [MatTabGroup, MatTab, MatTabLabel, MatBadge, MatTabContent, AllBusinessListComponent, ActiveBusinessListComponent, InactiveBusinessListComponent]
})
export class UsersComponent implements OnInit {
  currentStepIndex = 0;
  tabs: Array<any> = [
    {
      id: 1,
      title: 'All Business',
      badge: 0,
      index: 0,
    },
    {
      id: 2,
      title: 'Active Business',
      badge: 0,
      index: 1,
    },
    {
      id: 3,
      title: 'Inactive Business',
      badge: 0,
      index: 2,
    }
  ];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  onTabChange(event: any) {
    this.currentStepIndex = event.index;
    // Optionally update URL if needed
    // const urls = this.router.url.split('?', 1);
    // if (history.pushState) {
    //   var newurl =
    //     window.location.protocol +
    //     '//' +
    //     window.location.host +
    //     '#' +
    //     urls[0] +
    //     '?currentStepIndex=' +
    //     event.index;
    //   window.history.pushState({ path: newurl }, '', newurl);
    // }
  }

}
