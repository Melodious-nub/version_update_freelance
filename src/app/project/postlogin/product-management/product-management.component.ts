import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent {
  centered = false;
  disabled = false;
  unbounded = false;

  constructor(private router: Router) { }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }

}
