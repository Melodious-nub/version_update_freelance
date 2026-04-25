import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-active-business',
    templateUrl: './active-business.component.html',
    styleUrls: ['./active-business.component.scss'],
    imports: [RouterOutlet]
})
export class ActiveBusinessComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
