import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-inventoryout',
    templateUrl: './inventoryout.component.html',
    styleUrls: ['./inventoryout.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class InventoryoutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
