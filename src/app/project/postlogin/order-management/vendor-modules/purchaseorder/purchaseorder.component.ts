import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-purchaseorder',
    templateUrl: './purchaseorder.component.html',
    styleUrls: ['./purchaseorder.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class PurchaseorderComponent {
  constructor() {}
}
