import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-management',
  templateUrl: './invoice-management.component.html',
  styleUrls: ['./invoice-management.component.scss'],
})
export class InvoiceManagementComponent implements OnInit {
  constructor(public router: Router) {}

  ngOnInit(): void {}

}
