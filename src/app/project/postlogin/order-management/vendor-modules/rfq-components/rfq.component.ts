import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-rfq',
    templateUrl: './rfq.component.html',
    styleUrls: ['./rfq.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class RfqComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
