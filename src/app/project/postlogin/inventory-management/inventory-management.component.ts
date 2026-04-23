import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-inventory-management',
    templateUrl: './inventory-management.component.html',
    styleUrls: ['./inventory-management.component.scss'],
    standalone: true
})
export class InventoryManagementComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }
}
