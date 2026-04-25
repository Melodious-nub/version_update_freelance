import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-invoice-management',
    templateUrl: './invoice-management.component.html',
    styleUrls: ['./invoice-management.component.scss'],
    imports: [RouterOutlet]
})
export class InvoiceManagementComponent implements OnInit {
  constructor(public router: Router) {}

  ngOnInit(): void {}

}
