import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-inactive-business',
    templateUrl: './inactive-business.component.html',
    styleUrls: ['./inactive-business.component.scss'],
    imports: [RouterOutlet]
})
export class InactiveBusinessComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
