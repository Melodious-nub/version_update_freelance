import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-quotation',
    templateUrl: './quotation.component.html',
    styleUrls: ['./quotation.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class QuotationComponent {
  constructor() {}
}
