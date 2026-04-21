import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss'],
})
export class CustomerManagementComponent implements OnInit {
  currentStepIndex = 0;
  tabs: Array<any> = [
    {
      id: 1,
      title: 'Rec. RFQs',
      badge: 0,
      index: 0,
    },
    {
      id: 2,
      title: 'Quotation',
      badge: 0,
      index: 1,
    },
    {
      id: 3,
      title: 'Received PO',
      badge: 0,
      index: 2,
    },
     {
      id: 4,
      title: 'Invoice',
      badge: 0,
      index: 3,
    },
  ];
  @Input('single') single = false;
  @Input('customerId') customerId: any = null;
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.currentStepIndex = this.route.snapshot.queryParams.currentStepIndex;
    // if (
    //   window.location.href.includes('lead') ||
    //   window.location.href.includes('prospect')
    // ) {
    //   this.tabs.splice(1, 1);
    // }
  }

  onTabChange(event: any) {
    const urls = this.router.url.split('?', 1);
    if (history.pushState) {
      var newurl =
        window.location.protocol +
        '//' +
        window.location.host +
        '#' +
        urls[0] +
        '?currentStepIndex=' +
        event.index;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  }
}
