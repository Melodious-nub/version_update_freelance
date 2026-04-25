import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-received-quotation',
    templateUrl: './receivedquotation.component.html',
    styleUrls: ['./receivedquotation.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class ReceivedQuotationComponent {
  constructor() {}
}
