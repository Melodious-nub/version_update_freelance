import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-product-tags',
    templateUrl: './product-tags.component.html',
    styleUrls: ['./product-tags.component.scss'],
    imports: [RouterOutlet]
})
export class ProductTagsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
