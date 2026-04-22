import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-rfq',
    templateUrl: './receivedquotation.component.html',
    styleUrls: ['./receivedquotation.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class ReceivedQuotationComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
