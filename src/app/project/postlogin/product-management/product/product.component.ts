import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    imports: [RouterOutlet]
})
export class ProductComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
