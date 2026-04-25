import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-receivedPo',
    templateUrl: './receivedPo.component.html',
    styleUrls: ['./receivedPo.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class ReceivedPoComponent {
  constructor() {}
}
