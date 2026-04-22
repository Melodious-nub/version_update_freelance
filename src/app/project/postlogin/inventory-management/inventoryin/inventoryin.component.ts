import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-product',
    templateUrl: './inventoryin.component.html',
    styleUrls: ['./inventoryin.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class InventoryinComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
