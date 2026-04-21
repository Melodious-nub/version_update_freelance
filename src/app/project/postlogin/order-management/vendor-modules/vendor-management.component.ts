import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vendor-management',
  templateUrl: './vendor-management.component.html',
  styleUrls: ['./vendor-management.component.scss'],
})
export class VendorManagementComponent implements OnInit {
  @Input('single') single = false;
  @Input('vendorId') vendorId = false;
  currentStepIndex = 0;
  tabs: Array<any> = [
    {
      id: 1,
      title: 'RFQ',
      badge: 0,
      index: 0,
    },
    {
      id: 2,
      title: 'Received Quotation',
      badge: 0,
      index: 1,
    },
    {
      id: 3,
      title: 'Purchase Order',
      badge: 0,
      index: 2,
    },
    {
      id: 4,
      title: 'Bills',
      badge: 0,
      index: 3,
    },
  ];

  constructor(private router: Router, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.currentStepIndex = this.route.snapshot.queryParams.currentStepIndex;
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
