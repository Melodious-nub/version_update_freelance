import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill-management',
  templateUrl: './bill-management.component.html',
  styleUrls: ['./bill-management.component.scss'],
})
export class BillManagementComponent implements OnInit {
  constructor(public router: Router) {}

  ngOnInit(): void {}

}
