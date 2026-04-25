import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.scss'],
    imports: [RouterOutlet]
})
export class SubscriptionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
