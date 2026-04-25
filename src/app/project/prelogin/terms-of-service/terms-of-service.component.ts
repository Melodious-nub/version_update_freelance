import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-terms-of-service',
    templateUrl: './terms-of-service.component.html',
    styleUrls: ['./terms-of-service.component.scss'],
    imports: [RouterLink]
})
export class TermsOfServiceComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
