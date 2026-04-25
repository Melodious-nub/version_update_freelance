import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-inventory-management',
    templateUrl: './inventory-management.component.html',
    styleUrls: ['./inventory-management.component.scss'],
    standalone: true
})
export class InventoryManagementComponent {
  constructor(private router: Router) { }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }
}
