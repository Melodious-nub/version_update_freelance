import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-inventory-management',
    templateUrl: './inventory-management.component.html',
    styleUrls: ['./inventory-management.component.scss'],
    standalone: true
})
export class InventoryManagementComponent {
    private router = inject(Router);
  constructor() { }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }
}
