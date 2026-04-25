import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
    styleUrls: ['./container.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class ContainerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
