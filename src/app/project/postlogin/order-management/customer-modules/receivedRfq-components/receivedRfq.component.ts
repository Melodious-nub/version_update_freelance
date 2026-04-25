import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-receivedRfq',
    templateUrl: './receivedRfq.component.html',
    styleUrls: ['./receivedRfq.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class ReceivedRfqComponent {
  constructor() {}
}
