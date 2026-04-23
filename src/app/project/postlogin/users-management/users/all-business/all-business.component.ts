import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-all-business',
    templateUrl: './all-business.component.html',
    styleUrls: ['./all-business.component.scss'],
    standalone: true,
    imports: [RouterOutlet]
})
export class AllBusinessComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
